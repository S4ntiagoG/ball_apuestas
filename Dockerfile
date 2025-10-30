# 1️⃣ Imagen base de Nginx
FROM nginx:alpine

# 2️⃣ Elimina archivos HTML por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# 3️⃣ Copia el contenido de la carpeta del proyecto real
COPY ball_Guess/ /usr/share/nginx/html/

# 4️⃣ Expone el puerto 80
EXPOSE 80

# 5️⃣ Ejecuta Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]

