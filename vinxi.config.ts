// vinxi.config.ts
export default {
  server: {
    ssr: {
      noExternal: [
        "react",
        "react-dom",
        "@tanstack/react-query",
        "@tanstack/react-query-devtools",
        "@tanstack/react-router",
        "@tanstack/react-start",
      ],
    },
  },
};
