import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

const siteUrl = 'https://clinica-estetica-mobile-joaosiilvva1s-projects.vercel.app/';
const shareImage = `${siteUrl}capa-compartilhamento-maria-yasmim-estetica.jpg`;
const pageTitle = 'Maria Yasmim Lopes Estética | Taboão da Serra';
const pageDescription =
  'Limpeza de pele profunda, massagem facial e hidratação Glow em Taboão da Serra. Atendimento personalizado com hora marcada.';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="theme-color" content="#FAF9F6" />
        <link rel="canonical" href={siteUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="Maria Yasmim Lopes Estética" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:image" content={shareImage} />
        <meta property="og:image:secure_url" content={shareImage} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Maria Yasmim Lopes Estética, com cuidados faciais em Taboão da Serra"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={shareImage} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
