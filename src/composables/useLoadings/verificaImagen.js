export const verificaImagen = (url) => {
  return new Promise((resolve, reject) => {
    if (!url) return reject("URL vacía");
    const img = new Image();
    img.src = url;
    console.log(img.src);
    img.onload = () => resolve(true); // Imagen cargada
    img.onerror = () => reject(false); // Error al cargar
  });
};
