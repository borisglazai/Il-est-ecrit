# Il est écrit… — Décisions de conception v1

11 septembre 2026. Responsable produit : Boris Elie Glazai. Ce document fixe la direction de réalisation ; il distingue les choix de conception des fonctionnalités effectivement livrées. Toute modification structurante fait l’objet d’une nouvelle décision versionnée.

## 1. Cap et audit

**Former une génération qui connaît la Parole de Dieu et sait s’y référer naturellement.** Signature : « Jusqu’à ce que la Parole devienne un réflexe. » Les six compétences et l’expérience Il est écrit constituent le cœur du produit. L’IA est un outil pédagogique subordonné au texte, à son contexte et à une validation éditoriale.

Forces du brief : problème concret (« Où est-ce écrit ? »), identité distinctive, progression quotidienne, refus de confondre spiritualité et performance, pluralité des références pertinentes, contenu séparé du texte biblique, direction visuelle déjà validée, exigence de persistance.

Faiblesses à corriger : le MVP initial cumule un volume éditorial élevé et plusieurs produits complexes ; les états proposés mélangent mémoire, compréhension et application ; les objectifs de temps ne définissent pas la charge réelle ; le diagnostic est insuffisamment spécifié ; la confiance déclarée par une IA n’est pas une mesure de fiabilité ; la gouvernance éditoriale, les conflits de synchronisation et les preuves d’acquisition demandent des règles explicites.

Audit du dépôt existant, version publiée 4 : application JavaScript statique dans `dist/`, sans serveur, sans tests ni dépendances déclarées. Les cinq onglets et le design sont présents. Seul le marqueur d’onboarding est enregistré. Les compteurs sont fictifs ; le sélecteur de référence n’est pas vérifié ; la mémorisation valide des clics ; le diagnostic est une seule question ; toutes les catégories Bible ouvrent Marc ; le Mode Désert ne corrige pas. Le message de sauvegarde est donc trompeur. Préserver les styles et le projet existant, corriger la boucle avant toute migration de framework.

## 2. Architecture produit arrêtée

Public principal du lancement : débutants et chrétiens habitués souhaitant consolider leurs repères. Les responsables restent un public cible, mais les exercices de transmission avancée viennent après validation du socle.

Les cinq onglets sont conservés : Aujourd’hui (action immédiate et révisions dues), Il est écrit (situations, citations, recherche), Bible (navigation et contexte), Parcours (itinéraires), Moi (preuves d’apprentissage et réglages). La recherche d’un passage sera aussi accessible depuis Bible. Aucun espace conversationnel ouvert.

Une session porte sur un passage principal et un objectif clair. Elle alterne rappel, contexte et application. Elle peut être interrompue sans perte. Une journée manquée ne retire aucun acquis. Une révision en retard est une occasion de consolidation, jamais une sanction.

Les parcours progressent en **séances**, pas en dates obligatoires : « Fondations — 30 étapes, à ton rythme ». La promesse 30 jours reste une indication de cadence quotidienne. Le Mode Désert du jour 21 devient un entraînement guidé optionnel ; le véritable mode sans indice est réservé aux personnes préparées.

## 3. Périmètres et critères de sortie

### Lot 1 : preuve fonctionnelle

Conserver le prototype, rendre l’onboarding et un mini diagnostic réels, implémenter une séance Matthieu 4:4 avec contexte Deutéronome 8:3, compréhension, texte à trous, rappel libre, référence et application. Enregistrer chaque réponse, l’usage d’indices, les erreurs, l’étape active et la prochaine révision. Afficher uniquement les statistiques réelles sur Aujourd’hui/Moi. La sauvegarde est locale et explicitement présentée comme telle. Les sections non réalisées portent la mention Aperçu.

Sortie : échec traité correctement ; réussite avec indice distincte ; rechargement/reprise ; achèvement idempotent ; aucun « maîtrisé » après une séance ; révision réellement datée ; export local possible ; aucun score inventé. Tests automatiques du moteur, puis recette sur téléphone avant de considérer le lot prêt à être publié.

### MVP pilote

Une seule traduction autorisée ; 66 livres avec fiches essentielles et navigation réelle ; 10 livres enrichis ; 40 passages pédagogiques (dont les 20 mémorisables proposés) ; 30 défis (3 par catégorie) ; environ 120 exercices relus ; Fondations 30 étapes entièrement jouable ; comptes et sauvegarde serveur ; répétition espacée ; recherche par référence et mots ; vérification des citations ; CMS minimal avec rôles, versions et publication. Textes à trous et réponses structurées, sans correction IA nécessaire pour finir une séance. Réponses libres bibliques hors corpus : non évaluées automatiquement.

L’ensemble des 40 fiches, 30 défis et 120 exercices est un objectif éditorial, pas un volume déjà produit ou validé. Le diagnostic du pilote comprend 6 questions adaptables, une par compétence sauf transmission qui reste facultative, et un rappel différé. La courte entrée du lot 1 ne prétend pas établir un profil complet.

### MVP public

Étendre à 100–150 passages, 100 défis et 300–500 exercices seulement après validation éditoriale. Ajouter les trois mini-parcours, Mode Désert 7 situations, correction libre contrôlée, accessibilité vérifiée et synchronisation éprouvée. Le nombre d’écrans n’est pas un critère de succès. Aucun abonnement technique externe n’est présumé activé par cette décision.

## 4. Système pédagogique

Conserver Connaître, Comprendre, Mémoriser, Retrouver, Appliquer, Transmettre comme dimensions indépendantes. Pour chaque passage, stocker les preuves par compétence ; ne pas transformer une reconnaissance à choix multiple en preuve de rappel libre. La récitation mot à mot est attachée à une traduction ; une paraphrase juste peut valider une compréhension, jamais une citation exacte.

**État de mémoire visible** : Nouveau → En apprentissage → À consolider → Retenu → Solide. « Maîtrise du passage » est un bilan distinct, accessible seulement quand plusieurs compétences sont démontrées. Règles de départ du pilote, à calibrer : Retenu exige deux rappels sans indice à des dates distinctes ; Solide exige trois rappels différés sur au moins 30 jours ; bilan de maîtrise exige aussi compréhension, référence et application dans deux situations nouvelles. Transmettre reste un badge de compétence séparé. Une seule interaction ne déclenche jamais ces états. Une erreur ultérieure peut ramener la mémoire à À consolider sans effacer l’historique.

Les niveaux globaux Découverte, Fondations, Enracinement, Approfondissement et Transmission deviennent des jalons de parcours avec critères publiés. Ne pas attribuer « Discernement » ou « Maîtrise » à une personne sur la base d’un total de points. Au démarrage, afficher « Profil en construction » plutôt qu’un diagnostic excessif.

Planification cible : FSRS pour le rappel mémoriel, avec une carte par passage/traduction/type de rappel (texte et référence séparés). Compréhension et application utilisent d’autres exercices et ne modifient pas arbitrairement la stabilité mémoire. Conserver version de l’algorithme, paramètres, journal des révisions et temps écoulé. Valeurs initiales standard, puis calibration ; pas d’optimisation individuelle sur trois réponses. Le lot 1 utilise une règle provisoire explicite (échec/indice : lendemain ; réussite : 1, 3, 7, 14, 30 jours), qui ne doit pas être présentée comme FSRS.

Charge cible du pilote : 5 minutes = révisions prioritaires et au plus un nouveau passage ; 10 minutes = un nouveau passage et application ; 15–20 minutes = approfondissement facultatif. Réduire les nouveautés si une dette de révisions apparaît. Proposer une prolongation, ne pas imposer de finir tout le retard. Temps annoncé estimé, temps réel mesuré sans pénaliser les lecteurs lents.

Diagnostic : autoévaluation utile à la présentation ; réponses observées utiles à la difficulté. « Je ne sais pas » est une réponse normale. Aucune attribution de niveau spirituel. Réévaluation J30/J60/J90 avec questions équivalentes inédites, rappel sans indices et dénominateurs visibles.

Liste initiale : conserver les 20 propositions, mais étudier Jacques 4:7 en entier (soumission à Dieu incluse), Philippiens 4:13 avec 4:10–13 (contentement), Romains 8:28 avec 8:26–30. Distinguer la portion récitée du contexte disponible. Ajouter ultérieurement 1 Jean 1:9 et Éphésiens 2:8–10 pour le pardon et la grâce. Éviter d’en faire 22 obligations pendant la première semaine.

## 5. Rigueur éditoriale et IA

Chaque fiche sépare citation exacte, reformulation, observation du contexte, interprétation et application. Les auteurs et dates disputés portent « attribution traditionnelle » ou une plage argumentée. Le canon de lancement est explicitement celui de 66 livres retenu par le projet, sans présenter les autres traditions comme ignorantes de la Bible.

Workflow corrigé : Brouillon → À vérifier → Validé → Publié → Archivé. « Généré IA » est une provenance, pas une étape obligatoire. Une modification d’un contenu publié crée une nouvelle version brouillon. Les utilisateurs restent attachés à la version vue lors de leur séance. Validation par une personne distincte de l’auteur pour les enseignements ; motif et identité du validateur conservés. Aucun contenu ne reçoit un tampon humain fictif.

Rôles : Super Admin gère les habilitations ; Éditeur crée ; Validateur approuve/refuse ; Support traite les problèmes de compte sans accès par défaut aux réponses libres. Les autorisations sont imposées par le serveur, pas seulement par les boutons du CMS. Le CMS pilote regroupe Contenus, Parcours, Validation et Utilisateurs plutôt que onze écrans séparés.

Correction d’application : pertinence, précision de la référence et respect du contexte évalués séparément. Une liste de références exemplaires reste ouverte à d’autres références. Résultats : pertinent, partiellement pertinent, hors contexte, incorrect, à nuancer ou non évalué. **Non évalué ne vaut pas incorrect.** Une réponse inconnue du corpus n’est pas automatiquement fausse.

Pipeline cible : normalisation de la référence → récupération du texte exact et des fiches publiées → contrôle déterministe des citations → analyse éventuelle par IA sur ces seules sources → réponse structurée avec sources et motifs → vérification serveur des références → affichage. Une panne IA laisse la séance structurée disponible. Référence introuvable, divergence de contexte ou manque de sources : abstention et renvoi au texte. La confiance auto-déclarée du modèle ne suffit pas ; automatisation conditionnée aux résultats sur un jeu de réponses expertisées, incluant paraphrases, passages alternatifs et contresens.

L’IA prépare les exercices dans le CMS, jamais en publication directe. Les variations changent les distracteurs et formulations sans altérer le texte canonique. Les réponses utilisateur sont des données, pas des instructions du système. Clé serveur uniquement, limitation de débit et budget, délais maximaux, suivi de coût par correction. Pas de choix de fournisseur bloquant pour le socle ; adaptateur de fournisseur ajouté lors du lot IA.

## 6. Architecture technique arrêtée

PWA mobile d’abord ; pas de double développement web/Expo au lancement. Conserver provisoirement le JavaScript existant pour la preuve fonctionnelle. Cible : React + TypeScript pour l’interface et le CMS, migrations incrémentales des écrans après tests du moteur. Le design ivoire, DM Serif Display/Manrope, brun et olive est conservé. Le sombre reste réservé au Mode Désert.

Séparation en quatre modules : contenu versionné ; moteur d’apprentissage pur ; persistance ; interface. Un cinquième module serveur porte les corrections IA. Pas de microservices prématurés. PostgreSQL/Supabase constitue la cible serveur pour Auth, données relationnelles et règles d’accès. Sites conserve l’identité du prototype et le dépôt ; le branchement au backend cible fait l’objet d’un lot distinct. Aucune base Supabase ni clé n’est disponible ou créée à ce stade.

Local : IndexedDB visé pour le pilote, petit stockage local versionné suffisant au lot 1. Serveur autoritaire sur la progression synchronisée ; journal append-only des tentatives et identifiants UUID pour dédoublonner ; sessions avec pointeur d’étape et version de contenu. Un envoi répété ne double pas les acquis. Les événements mémoire concurrents sont ordonnés/recalculés côté serveur. Pour les préférences seules, dernier changement valide avec numéro de version. UTC pour les instants, fuseau IANA de l’utilisateur pour la journée et les objectifs. Changer d’heure ou de fuseau ne crée pas un rappel différé fictif.

Le mode invité sera fusionné au compte par import idempotent, jamais par remplacement aveugle. Export et suppression de compte prévus au pilote. Minimiser les réponses personnelles conservées, pas de journal spirituel implicite ; statistiques agrégées distinctes des textes libres. Pas de donnée privée ni de secret dans le service worker. L’offline complet vient après preuve de synchronisation.

Accessibilité : focus visible, clavier, libellés, statut textuel en plus des couleurs, zones tactiles de 44 px, texte agrandissable, respect du mouvement réduit, contrastes vérifiés. Or doux décoratif ; brun/or sombre pour les libellés si nécessaire. Compacter les cartes sans supprimer l’espace de lecture.

## 7. Structure de données cible

| Ensemble | Tables et relations principales |
|---|---|
| Identité | profiles(id → auth.users, timezone, locale), learning_preferences(user_id, minutes, goals), role_assignments(user_id, role) |
| Canon/texte | canons, books(id, osis_id unique), canon_books(canon_id, book_id, position), translations(id, language, license, source_url, checksum), verses(translation_id, book_id, chapter, verse, text) |
| Passages | passages(id), passage_ranges(passage_id, ordinal, book_id, start_chapter, start_verse, end_chapter, end_verse), learning_cards(id, passage_id, translation_id, recall_type) |
| Éditorial | content_items(id, kind), content_versions(id, item_id, version, status, payload, provenance, author_id), validation_events(version_id, actor_id, decision, reason), publication_events(version_id, actor_id, timestamp), sources et content_sources |
| Pédagogie | themes, passage_themes, exercises(id, content_version_id, skill, difficulty), exercise_options(exercise_id, option_id, feedback), challenges, challenge_references(challenge_id, passage_id, relevance, rationale) |
| Parcours | learning_paths, path_steps(path_id, ordinal), path_items(step_id, exercise_version_id, ordinal), user_path_progress(user_id, path_id, step_id, completed_at) |
| Activité | learning_sessions(id, user_id, content_version, status, cursor), attempts(id, session_id, exercise_version_id, skill, answer, outcome, hints, created_at), evidence(attempt_id, skill, score, rubric_version) |
| Mémoire | review_cards(user_id, learning_card_id, algorithm_version, stability, difficulty, due_at, last_review_at), review_events(id, card_id, attempt_id, rating, elapsed_days, created_at) |
| Adaptation | skill_snapshots(user_id, skill, coverage, evidence_count, computed_at), diagnostic_runs et diagnostic_answers |
| IA | ai_jobs, ai_evaluations(attempt_id, model_version, prompt_version, source_versions, result, abstained, cost), editorial_review_queue |

Contraintes : PK UUID pour événements ; unicité (translation, book, chapter, verse), (item, version), (user, learning_card), (path, ordinal) ; FK sur chaque relation ; progression calculée à partir des tentatives, jamais remplacée par un nombre venant du client. Les plages bibliques sont ordonnées et validées contre le corpus. Pas de duplication du texte dans chaque exercice. Les versions de contenu citées par l’historique ne sont pas effacées.

Index prioritaires : révisions (user_id, due_at), tentatives (user_id via session, created_at), références bibliques, statut/version de contenu. RLS et droits SQL sur chaque table exposée : lecture personnelle des données d’apprentissage, contenus publiés lisibles, brouillons réservés aux rôles autorisés. Les clés de service restent côté serveur. La publication et la finalisation de session sont transactionnelles ; les transitions illégales sont refusées. Les migrations sont additives, testées sur une base vierge et une copie contenant des données ; restauration testée avant migration destructive. Ce schéma logique doit être traduit en migrations dans le lot serveur, il n’est pas une base déjà provisionnée.

## 8. Feuille de route et gates

1. **Socle actuel** : audit, décisions, moteur de preuve et sauvegarde locale, suppression des statistiques fictives des écrans actifs. Gate : tests du moteur et recette de la boucle, limites visibles.
2. **Structure durable** : migration progressive React/TypeScript, adaptateurs de persistance, import texte autorisé, comptes/PostgreSQL, migrations et RLS. Gate : deux comptes isolés, déconnexion/reconnexion, reprise multiappareil, envois répétés sans doublon.
3. **Contenus et CMS** : rôles, versions, validations, pilote éditorial complet, carte de Bible. Gate : auteur ne publie pas seul, aucun brouillon accessible à l’apprenant, traçabilité des corrections.
4. **Apprentissage pilote** : FSRS, six dimensions, diagnostic et Fondations, recherche et citations. Gate : rappel différé distinct des clics, dette de révisions limitée, tests de changement de date/fuseau.
5. **IA encadrée** : corpus récupéré, barèmes, abstention, jeu d’évaluation relu, panne et budget. Gate : aucune référence inventée acceptée dans le jeu de contrôle ; erreurs théologiques critiques corrigées avant ouverture. Publier les taux mesurés et tailles d’échantillon, pas un taux de confiance de façade.
6. **Bêta et extension** : recette mobile réelle, accessibilité, 10–20 utilisateurs volontaires, suivi J7/J30 puis J60, corrections, extension du corpus et parcours, offline après synchronisation. Le recrutement est une proposition, aucun message n’est envoyé.

L’effort dépend surtout de la relecture biblique et des services disponibles. Ne pas annoncer une date de livraison garantie avant d’avoir mesuré un lot complet. Chaque lot : problème, diff borné, tests, notes de version, version sauvegardée et décision de publication. Aucun redémarrage global pour un correctif visuel.

## 9. Mesures de succès

Critère principal : amélioration du rappel sans indice et de l’usage contextualisé à distance, sur les contenus réellement enseignés. Rétention J7/J30/J60 par cohorte, taux de révision des cartes dues, rappel texte et référence séparés, réussite sur situations nouvelles, erreurs de contexte, taux d’abstention IA et charge réelle des séances. Afficher couverture et taille d’échantillon. Ne pas afficher « 27 % de la Bible » parce que 27 % des cartes ont été ouvertes. « Livres explorés » signifie une fiche consultée, pas une maîtrise du livre.

## 10. Sources techniques consultées

- FSRS/TypeScript : https://open-spaced-repetition.github.io/ts-fsrs/ — planification mémoire ; ne mesure pas la compréhension.
- Supabase RLS : https://supabase.com/docs/guides/database/postgres/row-level-security — combiner politiques et privilèges, tester autorisations et refus.
- Louis Segond 1910 : https://ebible.org/fraLSG/copyright.htm — cette édition y est indiquée comme domaine public. Consigner la source exacte de l’import et vérifier les autres traductions séparément.

## 11. État de livraison de cette étape

Le lot ajoute un moteur local, des exercices contrôlés et de la progression réelle au prototype existant. Le moteur provisoire n’est pas FSRS. Les contenus pédagogiques de cette démonstration sont à relire par le validateur biblique ; ils ne portent aucune certification humaine. Comptes, synchronisation, CMS, corpus complet et IA restent à réaliser selon les gates ci-dessus. Le code est sauvegardé sans remplacer automatiquement la version publique.


## Décision visuelle v2 — 11 septembre 2026

À la demande de Boris, renforcer la présence et la modernité de l’interface : conserver le fond ivoire #F7F2E8, utiliser un olive profond #344C3C pour les actions et la séance, un abricot #F3C5A2 pour le bouton de démarrage, des surfaces différenciées pour les statistiques et les catégories. Titres de page Manrope affirmés ; citations et titres de séance DM Serif Display. Navigation avec icônes SVG cohérentes, marque présente sur mobile, cartes compactes, contrastes renforcés et retours tactiles sobres. Le sombre reste réservé au Mode Désert.

Implémentation dans identity.css pour isoler cette évolution de la logique pédagogique. Huit tests fonctionnels existants réussis après modification. Aucun test visuel dans un navigateur réel effectué. Version sauvegardée, non publiée.

## Décision technique v2 — Pilote serveur

Le lot suivant utilise D1 et l’identité ChatGPT fournies par Sites pour activer la sauvegarde du pilote. Cette décision remplace le besoin immédiat d’un projet Supabase. Les comptes grand public indépendants et PostgreSQL restent une cible à réévaluer avant ouverture publique. L’accès à la base est isolé dans `server/api.mjs`, la validation et le calcul pédagogique dans `server/state.mjs`, la synchronisation dans `dist/assets/sync.js`. Pas de migration simultanée du framework d’interface. Voir LOT-2.md pour l’implémentation, les 18 tests, les limites et la recette d’activation. Une validation locale ne constitue pas une validation de la base distante.


## Décision technique v3 — Indépendance demandée par le propriétaire

La solution D1/identité ChatGPT du lot 2 est abandonnée comme cible d’activation avant toute publication. Le démarrage principal devient Node/PostgreSQL avec un adaptateur Supabase Auth. Le prototype publié reste inchangé. La base sépare désormais comptes, points de reprise, séances et réponses, avec politiques RLS et transactions. Les composants Sites restent historiques et ne sont pas nécessaires au déploiement indépendant. Le transfert du dépôt à un compte Git personnel et le raccordement aux services du propriétaire restent nécessaires. Voir README.md et LOT-3.md.
