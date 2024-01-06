"use server";

import { EmailContent, EmailProductInfo, NotificationType } from '@/types';
import nodemailer from 'nodemailer';

const Notification = {
  WELCOME: 'WELCOME',
  CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
  LOWEST_PRICE: 'LOWEST_PRICE',
  THRESHOLD_MET: 'THRESHOLD_MET',
}

export async function generateEmailBody(
  product: EmailProductInfo,
  type: NotificationType
) {
  const THRESHOLD_PERCENTAGE = 40;
  // Shorten the product title
  const shortenedTitle =
    product.title.length > 20
      ? `${product.title.substring(0, 20)}...`
      : product.title;

  let subject = "";
  let body = "";

  switch (type) {
    case Notification.WELCOME:
      subject = `Bem-vindo ao rastreamento de preços para ${shortenedTitle}`;
      body = `
        <div>
          <h2>Bem-vindo ao PriceWise 🚀</h2>
          <p>Você está rastreando agora ${product.title}.</p>
          <p>Aqui está um exemplo de como você receberá atualizações:</p>
          <div style="border: 1px solid #ccc; padding: 10px; background-color: #f8f8f8;">
            <h3>${product.title} está de volta em estoque!</h3>
            <p>Estamos animados em informar que ${product.title} está agora de volta em estoque.</p>
            <p>Não perca - <a href="${product.url}" target="_blank" rel="noopener noreferrer">compre agora</a>!</p>
            <img src="https://i.ibb.co/pwFBRMC/Screenshot-2023-09-26-at-1-47-50-AM.png" alt="Imagem do produto" style="max-width: 100%;" />
          </div>
          <p>Fique ligado para mais atualizações sobre ${product.title} e outros produtos que você está rastreando.</p>
        </div>
      `;
      break;

    case Notification.CHANGE_OF_STOCK:
      subject = `${shortenedTitle} está de volta em estoque!`;
      body = `
        <div>
          <h4>Olá, ${product.title} está agora reabastecido! Pegue o seu antes que acabe novamente!</h4>
          <p>Veja o produto <a href="${product.url}" target="_blank" rel="noopener noreferrer">aqui</a>.</p>
        </div>
      `;
      break;

    case Notification.LOWEST_PRICE:
      subject = `Alerta de Preço Mais Baixo para ${shortenedTitle}`;
      body = `
        <div>
          <h4>Olá, ${product.title} atingiu seu preço mais baixo de todos os tempos!!</h4>
          <p>Pegue o produto <a href="${product.url}" target="_blank" rel="noopener noreferrer">aqui</a> agora.</p>
        </div>
      `;
      break;

    case Notification.THRESHOLD_MET:
      subject = `Alerta de Desconto para ${shortenedTitle}`;
      body = `
        <div>
          <h4>Olá, ${product.title} está agora disponível com um desconto de mais de ${THRESHOLD_PERCENTAGE}%!</h4>
          <p>Pegue imediatamente <a href="${product.url}" target="_blank" rel="noopener noreferrer">aqui</a>.</p>
        </div>
      `;
      break;

    default:
      throw new Error("Tipo de notificação inválido.");
  }

  return { subject, body };
}

const transporter = nodemailer.createTransport({
  pool: true,
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  maxConnections: 1
});

export const sendEmail = async (emailContent: EmailContent, sendTo: string[]) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: sendTo,
      html: emailContent.body,
      subject: emailContent.subject,
    };

    await transporter.sendMail(mailOptions);
    console.log('E-mail enviado com sucesso');
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
};
