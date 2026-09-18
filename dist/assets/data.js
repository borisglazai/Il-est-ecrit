(() => {
const reviews = [
  {ref:'Matthieu 4:4', label:'Révision recommandée', state:'En apprentissage'},
  {ref:'Psaume 23:1', label:'Mémoire fragile', state:'Fragile'},
  {ref:'Jacques 4:7', label:'Référence à renforcer', state:'Connu'}
];
const paths = [
  {title:'Fondations', days:'30 jours', level:'Débutant', progress:40, skill:'Repères essentiels'},
  {title:'Connaître Jésus', days:'14 jours', level:'Tous niveaux', progress:14, skill:'Évangiles'},
  {title:'Apprendre à prier avec la Bible', days:'10 jours', level:'Intermédiaire', progress:0, skill:'Prière'},
  {title:'Quand la peur parle', days:'7 jours', level:'Tous niveaux', progress:0, skill:'Application'}
];
const testament = {
  'Ancien Testament': [['Pentateuque','5 livres'],['Livres historiques','12 livres'],['Livres poétiques','5 livres'],['Prophètes majeurs','5 livres'],['Prophètes mineurs','12 livres']],
  'Nouveau Testament': [['Évangiles','4 livres'],['Actes','1 livre'],['Épîtres pauliniennes','13 livres'],['Épîtres générales','8 livres'],['Apocalypse','1 livre']]
};
window.IEE_DATA = {reviews, paths, testament};
})();
