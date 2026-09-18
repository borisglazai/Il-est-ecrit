# Lot 1 — Journal de réalisation

11 septembre 2026.

## Réalisé

- Audit du prototype v4 et dossier de conception avec périmètres, modèle pédagogique, architecture, données et feuille de route.
- Conservation du projet et de l’identité visuelle existants.
- Moteur local séparé du rendu et fiche pédagogique séparée des composants.
- Mini diagnostic de trois questions avec résultats observés ; aucune attribution fictive de niveau.
- Séance Matthieu 4:4 : contexte de Deutéronome 8:3, compréhension, deux mots manquants, saisie de mémoire, référence, application acceptant deux passages pertinents, bilan.
- Sauvegarde versionnée des préférences, tentatives, erreurs, indices utilisés, étape active, mémorisation en cours, sessions achevées et révisions datées.
- Aujourd’hui et Moi affichent les données réelles. Les autres modules sont signalés comme aperçus et conservent leurs limites de prototype.
- Export JSON de la progression ; stockage indisponible ou corrompu signalé. Aucun effacement automatique d’une sauvegarde illisible.
- Compacité mobile, focus visible, boutons et champs accessibles, adaptation aux marges de sécurité du téléphone.

## Vérifié automatiquement

Commande : `node --test tests/learning.test.cjs tests/session.test.cjs`.

8 tests réussis : première réussite sans maîtrise prématurée ; répétitions dans la même journée ; échec et indice ; dédoublonnage et achèvement idempotent ; sauvegarde/rechargement ; erreur de stockage ; tolérance typographique ; parcours simulé avec mauvaise réponse, bonne réponse, reprise et rechargement final.

Le test d’intégration exécute le JavaScript avec une interface DOM simulée. Il ne remplace pas une recette dans Safari sur iPhone. Aucun test visuel ou navigateur réel n’a été effectué. Vérification syntaxique effectuée sur les scripts modifiés.

## Limites et suite

Une seule séance, durée estimée fixe ; répétition provisoire à intervalles, pas FSRS ; sauvegarde dans ce navigateur uniquement ; pas d’import utilisateur de l’export ; pas de comptes, de serveur, de CMS opérationnel ou d’IA. La reprise sauvegarde les réponses soumises, pas une saisie encore non envoyée. Le diagnostic à trois questions est un point d’entrée, pas un profil biblique exhaustif.

Les fiches ont besoin d’une relecture éditoriale humaine. Le lot n’est pas déclaré prêt pour lancement. La recette réelle sur téléphone et la revue biblique restent les gates avant publication. Le dépôt est sauvegardé ; la version en ligne reste inchangée.

Le changement suivant doit renforcer les adaptateurs de données, ajouter la base et les contrôles d’accès, puis migrer les écrans progressivement. Conserver le journal des tentatives lors de la migration. Rejouer les tests du moteur à chaque modification de progression.
