# Lot 2 — Comptes et sauvegarde serveur

## Décision

Pour le pilote hébergé dans Sites, utiliser l’identité fournie par la connexion ChatGPT et D1. Cette étape évite de bloquer le projet sur la création d’un service Supabase externe. Les comptes indépendants de ChatGPT, PostgreSQL et la migration React/TypeScript restent des évolutions ultérieures, pas des composants de ce lot. Conserver le projet, le rendu et les données historiques.

## Implémentation

- Un Worker sert les mêmes fichiers d’interface et les deux API `/api/account` et `/api/progress`.
- L’identité vient exclusivement des en-têtes authentifiés du répartiteur Sites. Le corps et les paramètres des requêtes ne choisissent jamais l’utilisateur.
- Migration Drizzle initiale : `learner_states`, clé primaire utilisateur, progression JSON structurée, révision, identifiant de dernière écriture et date serveur.
- Le stockage d’un document par utilisateur est transitoire pour le pilote à une séance. L’historique des tentatives reste inclus. Il pourra être normalisé dans les tables pédagogiques cibles sans être effacé.
- Lecture et écriture restreintes à l’utilisateur connecté ; origine vérifiée pour les mutations ; JSON uniquement ; taille de requête limitée à 2 Mo ; aucune réponse personnelle mise en cache HTTP.
- Les réponses sont contrôlées, les compteurs et révisions recalculés côté serveur ; les agrégats fournis par le navigateur sont ignorés. Une séance déclarée terminée sans preuves attendues est refusée.
- Écriture conditionnée à la révision attendue : les changements concurrents produisent un conflit explicite. Aucun remplacement silencieux par le dernier appareil.
- La répétition du même envoi ne crée pas de révision supplémentaire.
- Le navigateur garde les modifications non envoyées dans un cache de récupération lié à l’identifiant du compte. Il ne mélange pas les caches de deux personnes utilisant le même navigateur.
- L’ancienne progression locale est proposée au transfert explicite quand le compte est encore vide ; elle n’est jamais supprimée automatiquement.
- Lors d’un conflit, l’utilisateur peut exporter ses réponses locales et reprendre celles du serveur. Une copie de récupération est conservée avant le remplacement de l’état actif.
- En cas de coupure après ouverture, les réponses attendent une reconnexion. Une ouverture complètement hors ligne n’est pas encore disponible : le compte doit d’abord être identifié.
- Moi affiche l’état de sauvegarde, la date connue, l’export et la déconnexion. Une connexion expirée interrompt les mutations jusqu’à reconnexion.

## Vérifications

18 tests passent : 8 tests pédagogiques/existants, 6 tests API utilisant SQLite réel avec la migration générée, 4 tests du client de synchronisation. Les tests couvrent deux identités distinctes, tentative d’identité injectée dans le corps, requête anonyme, mauvaise origine, payload invalide, conflit d’écriture, répétition d’envoi, recalcul des agrégats, import historique, indisponibilité de stockage, coupure réseau, reprise et séparation des caches.

La construction du Worker et de ses ressources réussit. Les requêtes de la base sont préparées, limitées à une instruction et indexées par la clé utilisateur. Aucun schéma n’est créé pendant une requête.

## Ce qui n’est pas encore vérifié

Ce lot est sauvegardé sans publication. Les migrations D1 ne s’appliquent qu’à la publication. La base distante, les en-têtes d’identité en production, la reconnexion réelle et la continuité téléphone/ordinateur ne sont donc pas encore validés. Les tests SQLite locaux ne sont pas une recette D1 distante, et les tests de synchronisation ne sont pas une recette Safari.

## Recette d’activation

1. Publier cette version avec la migration initiale, en conservant l’accès privé actuel.
2. Transférer une progression existante ; vérifier la date de sauvegarde ; recharger ; se déconnecter et reconnecter.
3. Vérifier la reprise depuis un autre appareil connecté au même compte.
4. Tester deux onglets : provoquer un conflit, exporter la copie locale, reprendre la version serveur.
5. Une recette avec un second compte réel nécessite un accès de test explicitement accordé ; aucun accès supplémentaire n’est créé par ce lot.
6. Après cette validation, poursuivre le CMS et les contenus publiés. Ne pas assimiler les modules de démonstration à des fonctionnalités achevées.

## Retour arrière

La version statique précédente peut être redéployée si nécessaire. La table ajoutée reste en place ; ne pas supprimer les données serveur. L’ancienne clé locale est conservée. Un retour à la version statique ne synchronise pas automatiquement les changements effectués depuis la migration : exporter au préalable la progression récente. Aucun retrait de table ne fait partie du rollback.
