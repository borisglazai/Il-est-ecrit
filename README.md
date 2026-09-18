# Il est écrit…

Application d’apprentissage biblique. Le démarrage principal est désormais indépendant de ChatGPT Sites : client web, serveur Node, PostgreSQL, adaptateur Supabase Auth. Aucun compte ChatGPT n’est requis par ce serveur.

## Démarrer

Pré requis : Node 24, PostgreSQL 16 ou supérieur et projet Supabase Auth (hébergé ou auto-hébergé). Le serveur PostgreSQL peut être celui du projet Supabase ou un autre serveur.

1. `npm ci`
2. Copier `.env.example` vers `.env` et renseigner les valeurs.
3. Avec une connexion administrative distincte, `npm run db:migrate`.
4. Créer un login PostgreSQL non-superutilisateur, sans BYPASSRLS, avec mot de passe fort fourni par le gestionnaire de secrets ; lui accorder le rôle `iee_app`. Renseigner ce login dans DATABASE_URL. Ne pas utiliser le compte administratif comme compte d’exécution.
5. `npm run build`
6. `npm start`

Le serveur s’arrête si des valeurs manquent ou si le rôle d’exécution contourne les politiques RLS. La construction n’exige aucune clé privée. Ne jamais placer une clé de service Supabase dans SUPABASE_PUBLISHABLE_KEY : ce champ est public et accessible au navigateur.

## Réglages Supabase Auth

Activer courriel/mot de passe et confirmation d’adresse. Configurer Site URL et l’URL de retour autorisée sur l’origine exacte du déploiement, suivie de `/`. Le client utilise PKCE pour les retours de confirmation et de récupération. Configurer un service de courriels de production avant une ouverture aux utilisateurs. Tester création, confirmation, connexion, récupération et déconnexion avec des adresses de test réelles.

Les jetons sont gérés par le SDK officiel. Chaque appel API transmet un jeton ; le serveur vérifie l’identité auprès du fournisseur, sans faire confiance à un identifiant envoyé par le navigateur ni aux en-têtes ChatGPT. La clé de service n’est pas requise pour cette vérification.

## Structure

- `dist/` : interface existante conservée ; `assets/auth.js` est généré.
- `client/auth.js` : écrans et adaptateur d’authentification.
- `portable/node.mjs` : serveur HTTP Node, ressources et configuration publique.
- `portable/api.mjs` : contrat de l’API indépendant de l’hébergeur.
- `portable/auth.mjs` : vérification de l’identité auprès de Supabase Auth.
- `portable/postgres.mjs` : transactions PostgreSQL.
- `server/state.mjs` : validation et recalcul des données d’apprentissage.
- `migrations/postgres/` : migrations SQL versionnées ; elles remplacent D1 pour ce déploiement.
- `server/api.mjs`, `drizzle/`, `.openai/` et `scripts/build.mjs` : anciens composants Sites/D1, conservés pour la traçabilité. Le démarrage normal ne les utilise pas. La version D1 7 n’a pas été publiée et ne doit pas être activée.

## Déploiement

Le Dockerfile produit un serveur autonome. Construire avec `docker build -t il-est-ecrit .`, puis lancer avec les variables d’exécution injectées par l’hébergeur. Placer le service derrière HTTPS et définir APP_ORIGIN sur l’URL publique exacte. Le conteneur s’exécute sans privilèges root. Le serveur refuse les mutations provenant d’une autre origine et ne publie ni fichiers de configuration ni migrations.

Le Dockerfile est fourni mais n’a pas été exécuté ici : Docker n’est pas disponible dans cet environnement. Le client a été construit avec succès ; les modules serveur ont été vérifiés et leur logique testée. Les tests réseau avec une base PostgreSQL distante et un véritable fournisseur d’identité restent à réaliser.

Le code est actuellement versionné dans le dépôt existant. Pour le transférer à un dépôt personnel, créer un dépôt vide sous ton compte, ajouter son URL comme remote Git puis y pousser la branche et les tags. Aucune dépendance au fournisseur Git n’existe dans le démarrage de l’application. Le dépôt personnel de destination est https://github.com/borisglazai/Il-est-ecrit.

## Données et séparation des utilisateurs

Le schéma privé `iee` comprend users, progress, learning_sessions et learning_attempts. Les sessions et les réponses terminées sont stockées séparément et non modifiables par le rôle d’exécution. Le point de reprise conserve aussi un document JSON versionné pour assurer la compatibilité avec l’interface actuelle.

Toutes les tables appliquent RLS, y compris au propriétaire ordinaire. Le serveur définit le contexte utilisateur dans chaque transaction à partir de l’identité vérifiée. Ce contexte expire à la fin de la transaction. Les requêtes restent paramétrées et filtrées par utilisateur. Les identifiants de compte applicatifs sont conservés en UUID ; une migration de fournisseur d’identité devra maintenir leur correspondance avec les sujets de connexion.

Les écritures comparent la révision courante sous verrou transactionnel. Les conflits sont explicites ; un ancien appareil ne supprime pas l’historique. Les agrégats et dates de révision sont recalculés. Une interruption réseau conserve les réponses dans un cache local propre au compte ; la première ouverture complètement hors ligne reste hors périmètre.

## Sauvegardes et restauration

Planifier `pg_dump --format=custom --no-owner --file=backup.dump` avec PGSERVICE ou des secrets d’environnement, sans inscrire les identifiants dans une commande partagée. Conserver les sauvegardes chiffrées sur un stockage distinct. Sauvegarder la base et la configuration d’authentification : le seul schéma iee ne suffit pas à restaurer les comptes et leurs mots de passe. Avec Supabase, vérifier également l’export/restauration du schéma auth et les procédures du fournisseur.

Tester `pg_restore` sur une base isolée avec les rôles nécessaires avant de déclarer la sauvegarde exploitable. Contrôler les nombres de comptes, séances et réponses, les RLS et une reprise de progression. Cette restauration de production n’a pas encore été exécutée ; elle exige l’environnement réel. Définir ensuite rétention et fréquence en fonction de la perte de données acceptable.

## Validation

`npm test` : 23 tests. Les tests PostgreSQL utilisent PGlite (moteur PostgreSQL WebAssembly), avec le rôle iee_app et les politiques réelles. Ils ne simulent pas une connexion TCP ni le pool distant. Les tests du fournisseur d’identité utilisent des réponses contrôlées, sans envoyer de courriel réel.

Sources de référence :
- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/auth/jwts
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Projet Supabase configuré

Les identifiants publics fournis par Boris sont préremplis dans `.env.example`. Le 17 septembre 2026, `/auth/v1/settings` répond HTTP 200 avec cette clé. Cela ne valide pas encore une inscription, les courriels ni la sauvegarde de progression.

Pour installer les tables sans transmettre de mot de passe, exécuter intégralement `scripts/install-supabase.sql` dans le SQL Editor du projet. Le script est transactionnel, réexécutable et enregistre la même empreinte que le moteur de migrations. Il ne crée aucun utilisateur applicatif et ne supprime aucune donnée. Le login PostgreSQL d’exécution et ses secrets devront ensuite être configurés chez l’hébergeur. Aucun déploiement indépendant ni aucune migration distante n’ont été effectués à cette étape.

La migration 002 protège également la table technique des migrations (RLS et retrait des droits publics). Le script SQL Editor applique aussi cette protection lors de chaque exécution. Les fichiers `.openai/` ne sont pas transférés au dépôt indépendant.
