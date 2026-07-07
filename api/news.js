const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

module.exports = async function handler(req, res) {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      sorts: [
        {
          property: "公開日",
          direction: "descending",
        },
      ],
    });

    const news = response.results.map((page) => {
      return {
        id: page.id,
        title: page.properties["タイトル"]?.title?.[0]?.plain_text || "",
        date: page.properties["公開日"]?.date?.start || "",
        content:
          page.properties["内容"]?.rich_text
            ?.map((text) => text.plain_text)
            .join("") || "",
        published: page.properties["公開フラグ"]?.checkbox || false,
        sites:
          page.properties["掲載"]?.multi_select
            ?.map((item) => item.name) || [],
      };
    });

    res.status(200).json({
      news,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch news",
    });
  }
};