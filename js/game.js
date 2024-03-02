const grid = document.querySelector('.grid');

const cartasFront =[
    'carta-front-angular',
    'carta-front-c++',
    'carta-front-js',
    'carta-front-python',
    'carta-front-react',
    'carta-front-ruby'
]
const createElemment =(tag, className) =>{
    const element = document.createElement(tag);
    element.className = className;
    return element;
}

let firstCard = '';
let secondCard ='';

const checkCards =()=> {

}

const revealCard = ({target}) => {
    if(target.parentNode.className.includes(('reveal-card'))){
        return;
    }
    if(firstCard === ''){
        target.parentNode.classList.add('reveal-card');
        firstCard = target.parentNode;
    } else if (secondCard === ''){
        target.parentNode.classList.add('reveal-card');
        secondCard = target.parentNode;

    }

    target.parentNode.classList.add('reveal-card');
}

const createCard = (cartaFront) => {
    const card = createElemment('div', 'card')
    const front = createElemment('div', 'face front');
    const back = createElemment('div', 'face back');


    front.style.backgroundImage = `url(../images/programacao/${cartaFront}.png)`;
    card.appendChild(front);
    card.appendChild(back);

    card.addEventListener('click', revealCard);

    return card;
}

const loadGame = () => {
    const duplicatedCartasFront=[...cartasFront, ...cartasFront];

    const shuffledArray = duplicatedCartasFront.sort(()=> Math.random() - 0.5);

    duplicatedCartasFront.forEach((cartaFront)=>{
        const card = createCard(cartaFront);
        grid.appendChild(card);
    });
}

loadGame();

