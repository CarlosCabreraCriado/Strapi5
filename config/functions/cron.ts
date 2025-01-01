//import { strapi } from '@strapi/strapi';
//
export default {
  "*/1 * * * *": async () => {
    const now = new Date();

    try {
      const postsToPublish = await strapi.entityService.findMany(
        "api::post.post",
        {
          filters: {
            publicacion_automatica: { $eq: true },
            post_date: { $lte: now },
          },
        },
      );

      //Si se encuentran postst para publicar los publica automaticamente:
      if (Array.isArray(postsToPublish) && postsToPublish.length > 0) {
        postsToPublish.forEach(async (post) => {
          await strapi.documents("api::post.post").update({
            documentId: post.documentId,
            data: {
              publicacion_automatica: false,
            } as any,
            status: "published",
          });
        });
      }
    } catch (error) {
      console.error("Error en el cron job:", error);
    }
  },
};
