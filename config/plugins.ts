export default ({ env }) => ({
  "users-permissions": {
    config: {
      jwtSecret: env("JWT_SECRET"),
    },
  },
  upload: {
    config: {
      provider: "cloudinary",
      providerOptions: {
        cloud_name: env("CLOUDINARY_NAME"),
        api_key: env("CLOUDINARY_KEY"),
        api_secret: env("CLOUDINARY_SECRET"),
      },
      actionOptions: {
        upload: {
          folder: "Posts",
          asset_folder: "Posts",
        },
        uploadStream: {
          folder: "Posts",
          asset_folder: "Posts",
        },
        delete: {},
      },
    },
  },

  i18n: {
    enabled: true,
    config: {
      locales: ["en", "es"], // Agrega 'es' para español y otros idiomas que necesites
      defaultLocale: "es", // Establece 'es' como el idioma predeterminado si lo deseas
    },
  },
});
