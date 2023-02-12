FROM gcr.io/distroless/nodejs:16 as builder
WORKDIR '/app'
COPY . .
RUN ["/bin/sh", "-c", "npm install"]
# lets build the application
RUN ["/bin/sh", "-c", "npm run build"]
FROM nginx
EXPOSE 80
COPY --from=builder /app/build /usr/share/nginx/html
