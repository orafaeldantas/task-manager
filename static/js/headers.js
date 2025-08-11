
async function btnPerfil() {

    try {
        const response = await fetch('http://127.0.0.1:5000//get-user-name', {
            method: 'GET',
            headers: {
                'Accept': 'application/json' 
                }
            }); 

        const data = await response.json();

        username = data.name;

        console.log(username);
        
        showPerfil(username);

        } catch (error) {
            console.error('Erro ao buscar nome o nome do usuário', error);
            alert(`Não foi possível buscar o nome do usuário: ${error.message}`);
        }
}

function showPerfil(username){

    const divMaster = document.querySelector('.headers-details');

    const existingDiv = document.querySelector('.details-internal-headers');
    if (existingDiv) {
        existingDiv.remove();
    }

    const divSlave = document.createElement('div');

    divSlave.className = "details-internal-headers";

    const userImage = document.createElement('img');

    userImage.src = '/static/assets/svg/avatar.svg';

    userImage.style.width = '50px';
    userImage.style.height = '50px';
    userImage.style.borderRadius = '50%'; 
    userImage.style.marginBottom = '8px';

    const usernameText= document.createElement('p');
    usernameText.textContent = username;
        
    divSlave.appendChild(userImage);
    divSlave.appendChild(usernameText);
        

    divMaster.appendChild(divSlave);


    addClickOutsideListener(divSlave);

}    


function addClickOutsideListener(divToRemove) {
    
    document.addEventListener('click', (event) => {

        if (!divToRemove.contains(event.target) && divToRemove.parentNode) {
            
            divToRemove.remove();
            
             document.removeEventListener('click', addClickOutsideListener());
        }
    });
}