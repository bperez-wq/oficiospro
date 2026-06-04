import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://oficiospro.cl";
  const routes = [
    "",
    "/especialistas",
    "/club-hogar",
    "/empresas",
    "/registro-cliente",
    "/registro-especialista",
    "/login",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date("2026-06-04"),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
