
let showDetails = true;

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

    if (showDetails) {
        showDetails = false;

        const divMaster = document.querySelector('.headers-details');

        const existingDiv = document.querySelector('.details-internal-headers');
        if (existingDiv) {
            existingDiv.remove();
        }

        const divSlave = document.createElement('div');

        divSlave.className = "details-internal-headers";

        divSlave.textContent = username;

        divMaster.appendChild(divSlave);

        addClickOutsideListener(divSlave);

    } else {

        showDetails = true;

        const existingDiv = document.querySelector('.details-internal-headers');
        if (existingDiv) {
            existingDiv.remove();
        }

        
    }
   

}

function addClickOutsideListener(divToRemove) {
    
    document.addEventListener('click', (event) => {

        if (!divToRemove.contains(event.target) && divToRemove.parentNode) {
            
            // Remove a div do seu elemento pai
            divToRemove.remove();
            
            // Opcional: Remova o próprio ouvinte de evento para evitar vazamento de memória
            // document.removeEventListener('click', suaFuncao); // (Isso seria mais complexo, mas é uma boa prática)
        }
    });
}