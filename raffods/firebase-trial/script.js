document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Previene il comportamento default del form (il POST che causava l'errore)
    
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (file) {
        console.log("File selezionato:", file.name);
        // Qui andrà la logica di Firebase Storage
    } else {
        console.log("Nessun file selezionato");
    }
});
