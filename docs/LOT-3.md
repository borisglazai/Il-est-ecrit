# Lot 3 — Socle indépendant

## Réalisé

Le démarrage normal utilise Node/PostgreSQL et des comptes courriel/mot de passe Supabase Auth. Les en-têtes ChatGPT ne sont plus une source d’identité. La vérification serveur et l’accès SQL sont des modules séparés. Le code et les données sont transférables ; Supabase Auth reste un fournisseur à remplacer via son adaptateur et une migration des identités si besoin.

Le schéma PostgreSQL dispose de droits restreints, RLS forcée, historique des séances et réponses, migrations avec empreintes vérifiées, verrou de migration et écriture transactionnelle. Le design, la séance et les mécanismes de reprise existants sont conservés. Écrans d’inscription, connexion, demande de réinitialisation et changement de mot de passe ajoutés.

README, fichier d’environnement modèle et Dockerfile fournis. 23 tests passent, dont l’isolation RLS sur PostgreSQL local PGlite, l’immutabilité de l’historique et le refus des identités non vérifiées. Le client est construit. La version publiée de Sites reste le prototype précédent.

## Non encore raccordé

Pas de projet Supabase distant créé, de connexion SQL distante configurée, de SMTP testé, de dépôt GitHub personnel créé ni d’hébergement indépendant activé. Aucune inscription réelle ou validation de courriel n’a été exécutée. Docker et une restauration pg_dump/pg_restore ne sont pas testés ici.

## Actions nécessaires à l’activation

Créer ou sélectionner le projet Supabase du propriétaire ; renseigner son URL et sa clé publiable ; configurer les deux connexions PostgreSQL (migration et exécution) dans les secrets du déploiement ; créer le login d’exécution avec le rôle iee_app ; appliquer la migration ; régler URLs de retour et courriels ; déployer le conteneur sur l’hébergement choisi et transférer le dépôt à un compte Git personnel.

La base peut être celle de Supabase ou un PostgreSQL extérieur. Le fournisseur de base n’est pas inscrit dans les requêtes métier. Le choix d’hébergement n’oblige pas à changer le moteur pédagogique.

La prochaine recette doit couvrir deux comptes réels, confirmation, récupération de mot de passe, transfert local, deux appareils, conflit, coupure, sauvegarde et restauration. Ensuite seulement élargir le corpus et le CMS.
