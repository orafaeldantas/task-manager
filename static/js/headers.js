


async function btnPerfil() {

    try {
        const response = await fetch('http://127.0.0.1:5000//get-user-name', {
            method: 'GET',
            headers: {
                'Accept': 'application/json' 
                }
            }); 

        const username = await response.json();
        console.log(username);
             

        } catch (error) {
            console.error('Erro ao buscar nome o nome do usuário', error);
            alert(`Não foi possível buscar o nome do usuário: ${error.message}`);
        }
}