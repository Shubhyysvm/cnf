import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { MasterAdminPreference } from '../entities/master-admin-preference.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private isProduction: boolean;

  constructor(
    @InjectRepository(MasterAdminPreference)
    private masterAdminPreferenceRepository: Repository<MasterAdminPreference>,
  ) {
    this.isProduction = process.env.NODE_ENV === 'production' && process.env.PAYMENT_MODE !== 'test';
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Configure based on environment
    if (process.env.EMAIL_PROVIDER === 'smtp' && process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    } else {
      // Development: use Mailhog or local SMTP as fallback
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '1025'),
        secure: false,
      });
    }
  }

  async getAdminEmail(): Promise<string> {
    const adminEmailPref = await this.masterAdminPreferenceRepository.findOne({
      where: { key: 'admin_email' },
    });
    return adminEmailPref?.value || 'hemanthreddy.y143@gmail.com';
  }

  async getFromEmail(): Promise<string> {
    const fromEmailPref = await this.masterAdminPreferenceRepository.findOne({
      where: { key: 'email_from' },
    });
    return fromEmailPref?.value || 'noreply@countrynaturalfoods.com';
  }

  private getEmailPrefix(): string {
    return this.isProduction ? '' : '[TEST] ';
  }

  async sendAdminOrderNotification(orderData: any): Promise<void> {
    try {
      const adminEmail = await this.getAdminEmail();
      const fromEmail = await this.getFromEmail();
      const prefix = this.getEmailPrefix();

      const htmlContent = this.generateAdminOrderEmailHTML(orderData, this.isProduction);

      const mailOptions = {
        from: fromEmail,
        to: adminEmail,
        subject: `${prefix}New Order Received: ${orderData.orderNumber}`,
        html: htmlContent,
        replyTo: orderData.customerEmail,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Admin order notification sent to ${adminEmail}: ${info.messageId}`);

      // Log preview URL for test emails
      if (!this.isProduction) {
        this.logger.log(`Preview: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error('Failed to send admin order notification:', error);
      // Don't throw - we don't want email failure to break order creation
    }
  }

  async sendCustomerOrderConfirmation(orderData: any, customerEmail: string): Promise<void> {
    try {
      const fromEmail = await this.getFromEmail();
      const prefix = this.getEmailPrefix();

      const htmlContent = this.generateCustomerOrderEmailHTML(orderData, this.isProduction);

      const mailOptions = {
        from: fromEmail,
        to: customerEmail,
        subject: `${prefix}Order Confirmation: ${orderData.orderNumber}`,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Customer order confirmation sent to ${customerEmail}: ${info.messageId}`);

      // Log preview URL for test emails
      if (!this.isProduction) {
        this.logger.log(`Preview: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error('Failed to send customer order confirmation:', error);
      // Don't throw - we don't want email failure to break order creation
    }
  }

  private generateAdminOrderEmailHTML(orderData: any, isProduction: boolean): string {
    const testBanner = !isProduction
      ? '<div style="background-color: #ff7043; color: white; padding: 12px; text-align: center; font-weight: bold; margin-bottom: 20px; border-radius: 6px;">⚠️ TEST EMAIL - Sandbox order</div>'
      : '';

    const itemsHTML = orderData.items
      .map(
        (item: any) => `
        <tr>
          <td style="border: 1px solid #e5e7eb; padding: 10px;">${item.productName}${item.variantWeight ? ` <span style="color:#666;">(${item.variantWeight})</span>` : ''}</td>
          <td style="border: 1px solid #e5e7eb; padding: 10px; text-align: center;">${item.quantity}</td>
          <td style="border: 1px solid #e5e7eb; padding: 10px; text-align: right;">₹${Number(item.price).toFixed(2)}</td>
          <td style="border: 1px solid #e5e7eb; padding: 10px; text-align: right;">₹${Number(item.total).toFixed(2)}</td>
        </tr>
      `,
      )
      .join('');

    const orderSummary = `
      <div style="display:flex; gap:10px; margin-top:12px; flex-wrap:wrap;">
        <div style="flex:1; min-width:180px; background:#f1f8e9; padding:12px 14px; border-radius:6px; border:1px solid #dcedc8;">
          <div style="font-size:12px; color:#558b2f; text-transform:uppercase; letter-spacing:0.5px;">Subtotal</div>
          <div style="font-size:16px; font-weight:700; color:#2e7d32;">₹${Number(orderData.subtotal).toFixed(2)}</div>
        </div>
        <div style="flex:1; min-width:180px; background:#fff8e1; padding:12px 14px; border-radius:6px; border:1px solid #ffecb3;">
          <div style="font-size:12px; color:#f57c00; text-transform:uppercase; letter-spacing:0.5px;">Shipping</div>
          <div style="font-size:16px; font-weight:700; color:#e65100;">₹${Number(orderData.shippingCost).toFixed(2)}</div>
        </div>
        <div style="flex:1; min-width:180px; background:#e3f2fd; padding:12px 14px; border-radius:6px; border:1px solid #bbdefb;">
          <div style="font-size:12px; color:#1565c0; text-transform:uppercase; letter-spacing:0.5px;">Tax (GST)</div>
          <div style="font-size:16px; font-weight:700; color:#0d47a1;">₹${Number(orderData.tax).toFixed(2)}</div>
        </div>
        <div style="flex:1; min-width:180px; background:#2e7d32; padding:12px 14px; border-radius:6px; color:white; border:1px solid #1b5e20;">
          <div style="font-size:12px; opacity:0.9; text-transform:uppercase; letter-spacing:0.5px;">Total</div>
          <div style="font-size:18px; font-weight:800;">₹${Number(orderData.total).toFixed(2)}</div>
        </div>
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; background: #f8fafc; }
            .container { max-width: 720px; margin: 0 auto; padding: 24px; }
            .card { background: white; border-radius: 12px; padding: 22px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08); border: 1px solid #e5e7eb; }
            .header { background: linear-gradient(135deg, #2e7d32, #66bb6a); color: white; padding: 22px; border-radius: 12px; text-align: center; box-shadow: 0 10px 25px rgba(46,125,50,0.35); }
            .pill { display:inline-block; padding:6px 10px; background:rgba(255,255,255,0.12); border-radius:999px; font-size:12px; }
            .section { margin-top: 18px; border-radius: 10px; border: 1px solid #e5e7eb; background: #fff; padding: 16px; }
            .section-title { font-weight: 700; color: #2e7d32; margin-bottom: 10px; font-size: 15px; letter-spacing: 0.2px; }
            table { width: 100%; border-collapse: collapse; margin-top: 6px; }
            th { background-color: #f1f5f9; text-align: left; padding: 10px; border: 1px solid #e2e8f0; font-size: 13px; }
            td { padding: 10px; border: 1px solid #e2e8f0; font-size: 13px; }
            .total-row { font-weight: 700; background-color: #f8fafc; }
            .footer { margin-top: 18px; font-size: 12px; color: #475569; text-align: center; line-height: 1.6; }
            a { color: #2e7d32; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            ${testBanner}
            <div class="header">
              <div class="pill">Country Natural Foods</div>
              <h2 style="margin:10px 0 6px;">New Order Received</h2>
              <div style="opacity:0.9;">Order ${orderData.orderNumber}</div>
            </div>

            <div class="card" style="margin-top:-10px;">
              <div style="font-weight:700; font-size:16px; color:#111827;">New Order Alert - Action Required</div>
              <div style="margin-top:6px; color:#475569;">Review order details and process fulfillment.</div>
              ${orderSummary}
            </div>

            <div class="section">
              <div class="section-title">Order Items</div>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
            </div>

            <div class="section">
              <div class="section-title">Customer Information</div>
              <p style="margin:0 0 6px;"><strong>Name:</strong> ${orderData.customerName}</p>
              <p style="margin:0 0 6px;"><strong>Email:</strong> ${orderData.customerEmail}</p>
              <p style="margin:0;"><strong>Phone:</strong> ${orderData.customerPhone}</p>
            </div>

            <div class="section">
              <div class="section-title">Shipping Address</div>
              <p style="margin:0; line-height:1.5;">
                ${orderData.shippingAddress.recipientName}<br/>
                ${orderData.shippingAddress.line1}${orderData.shippingAddress.line2 ? '<br/>' + orderData.shippingAddress.line2 : ''}<br/>
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zip}<br/>
                ${orderData.shippingAddress.country}
              </p>
            </div>

            <div class="section" style="display:flex; gap:12px; flex-wrap:wrap;">
              <div style="flex:1; min-width:220px;">
                <div class="section-title">Order Details</div>
                <p style="margin:0 0 6px;"><strong>Date:</strong> ${new Date(orderData.createdAt).toLocaleString('en-IN')}</p>
                <p style="margin:0 0 6px;"><strong>Status:</strong> ${orderData.status}</p>
              </div>
              <div style="flex:1; min-width:220px;">
                <div class="section-title">Payment</div>
                <p style="margin:0 0 6px;"><strong>Method:</strong> ${orderData.paymentMethod}</p>
                <p style="margin:0;"><strong>Status:</strong> ${orderData.paymentStatus}</p>
              </div>
            </div>

            <div class="section" style="background:#f0f4e8; border:1px solid #c8e6c9;">
              <div class="section-title">Admin Actions</div>
              <p style="margin:0 0 8px;"><a href="https://localhost:3002/admin/orders/${orderData.orderNumber}" target="_blank" style="color:#2e7d32; font-weight:700;">🔗 View Order in Admin Portal</a></p>
              <p style="margin:0 0 8px;"><a href="https://localhost:3002/admin/orders/${orderData.orderNumber}/process" target="_blank" style="color:#2e7d32; font-weight:700;">⚙️ Process Order</a></p>
              <p style="margin:0 0 8px;"><a href="https://localhost:3002/admin/inventory" target="_blank" style="color:#2e7d32; font-weight:700;">📦 Update Inventory</a></p>
              <p style="margin:0;"><a href="https://localhost:3002/admin/orders" target="_blank" style="color:#2e7d32; font-weight:700;">📋 View All Orders</a></p>
            </div>

            <div class="section" style="background:#f8fafc; border-style:dashed;">
              <div class="section-title">Support</div>
              <p style="margin:0 0 6px;"><a href="https://www.countrynaturalfoods.com" target="_blank">Country Natural Foods</a></p>
              <p style="margin:0;">Contact: <a href="mailto:support@countrynaturalfoods.com">support@countrynaturalfoods.com</a></p>
            </div>

            <div class="footer">
              <p>Country Natural Foods Admin System</p>
              <p>This is an automated alert. Please review and process the order promptly.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateCustomerOrderEmailHTML(orderData: any, isProduction: boolean): string {
    const testBanner = !isProduction
      ? '<div style="background-color: #ff7043; color: white; padding: 12px; text-align: center; font-weight: bold; margin-bottom: 20px; border-radius: 6px;">⚠️ TEST ORDER - Sandbox</div>'
      : '';

    const itemsHTML = orderData.items
      .map(
        (item: any) => `
        <tr>
          <td style="border: 1px solid #e5e7eb; padding: 10px;">${item.productName}${item.variantWeight ? ` <span style="color:#666;">(${item.variantWeight})</span>` : ''}</td>
          <td style="border: 1px solid #e5e7eb; padding: 10px; text-align: center;">${item.quantity}</td>
          <td style="border: 1px solid #e5e7eb; padding: 10px; text-align: right;">₹${Number(item.price).toFixed(2)}</td>
          <td style="border: 1px solid #e5e7eb; padding: 10px; text-align: right;">₹${Number(item.total).toFixed(2)}</td>
        </tr>
      `,
      )
      .join('');

    const orderSummary = `
      <div style="display:flex; gap:10px; margin-top:12px; flex-wrap:wrap;">
        <div style="flex:1; min-width:180px; background:#f1f8e9; padding:12px 14px; border-radius:6px; border:1px solid #dcedc8;">
          <div style="font-size:12px; color:#558b2f; text-transform:uppercase; letter-spacing:0.5px;">Subtotal</div>
          <div style="font-size:16px; font-weight:700; color:#2e7d32;">₹${Number(orderData.subtotal).toFixed(2)}</div>
        </div>
        <div style="flex:1; min-width:180px; background:#fff8e1; padding:12px 14px; border-radius:6px; border:1px solid #ffecb3;">
          <div style="font-size:12px; color:#f57c00; text-transform:uppercase; letter-spacing:0.5px;">Shipping</div>
          <div style="font-size:16px; font-weight:700; color:#e65100;">₹${Number(orderData.shippingCost).toFixed(2)}</div>
        </div>
        <div style="flex:1; min-width:180px; background:#e3f2fd; padding:12px 14px; border-radius:6px; border:1px solid #bbdefb;">
          <div style="font-size:12px; color:#1565c0; text-transform:uppercase; letter-spacing:0.5px;">Tax (GST)</div>
          <div style="font-size:16px; font-weight:700; color:#0d47a1;">₹${Number(orderData.tax).toFixed(2)}</div>
        </div>
        <div style="flex:1; min-width:180px; background:#2e7d32; padding:12px 14px; border-radius:6px; color:white; border:1px solid #1b5e20;">
          <div style="font-size:12px; opacity:0.9; text-transform:uppercase; letter-spacing:0.5px;">Total</div>
          <div style="font-size:18px; font-weight:800;">₹${Number(orderData.total).toFixed(2)}</div>
        </div>
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; background: #f8fafc; }
            .container { max-width: 720px; margin: 0 auto; padding: 24px; }
            .card { background: white; border-radius: 12px; padding: 22px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08); border: 1px solid #e5e7eb; }
            .header { background: linear-gradient(135deg, #2e7d32, #66bb6a); color: white; padding: 22px; border-radius: 12px; text-align: center; box-shadow: 0 10px 25px rgba(46,125,50,0.35); }
            .pill { display:inline-block; padding:6px 10px; background:rgba(255,255,255,0.12); border-radius:999px; font-size:12px; }
            .section { margin-top: 18px; border-radius: 10px; border: 1px solid #e5e7eb; background: #fff; padding: 16px; }
            .section-title { font-weight: 700; color: #2e7d32; margin-bottom: 10px; font-size: 15px; letter-spacing: 0.2px; }
            table { width: 100%; border-collapse: collapse; margin-top: 6px; }
            th { background-color: #f1f5f9; text-align: left; padding: 10px; border: 1px solid #e2e8f0; font-size: 13px; }
            td { padding: 10px; border: 1px solid #e2e8f0; font-size: 13px; }
            .total-row { font-weight: 700; background-color: #f8fafc; }
            .footer { margin-top: 18px; font-size: 12px; color: #475569; text-align: center; line-height: 1.6; }
            a { color: #2e7d32; text-decoration: none; }
            .cta-button { display:inline-block; background:#2e7d32; color:white; padding:12px 18px; border-radius:8px; margin-top:12px; font-weight:700; }
          </style>
        </head>
        <body>
          <div class="container">
            ${testBanner}
            <div class="header">
              <div class="pill">Country Natural Foods</div>
              <h2 style="margin:10px 0 6px;">Thank you for your order!</h2>
              <div style="opacity:0.9;">Order ${orderData.orderNumber}</div>
            </div>

            <div class="card" style="margin-top:-10px;">
              <div style="font-weight:700; font-size:16px; color:#111827;">Here is your order summary</div>
              <div style="margin-top:6px; color:#475569;">We will send tracking as soon as it ships.</div>
              ${orderSummary}
              <a class="cta-button" href="https://www.countrynaturalfoods.com" target="_blank">Shop more products</a>
            </div>

            <div class="section">
              <div class="section-title">Order Items</div>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
            </div>

            <div class="section">
              <div class="section-title">Shipping Address</div>
              <p style="margin:0; line-height:1.5;">
                ${orderData.shippingAddress.recipientName}<br/>
                ${orderData.shippingAddress.line1}${orderData.shippingAddress.line2 ? '<br/>' + orderData.shippingAddress.line2 : ''}<br/>
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zip}<br/>
                ${orderData.shippingAddress.country}
              </p>
            </div>

            <div class="section" style="display:flex; gap:12px; flex-wrap:wrap;">
              <div style="flex:1; min-width:220px;">
                <div class="section-title">Order Details</div>
                <p style="margin:0 0 6px;"><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleString('en-IN')}</p>
                <p style="margin:0 0 6px;"><strong>Status:</strong> ${orderData.status}</p>
              </div>
              <div style="flex:1; min-width:220px;">
                <div class="section-title">Payment</div>
                <p style="margin:0 0 6px;"><strong>Method:</strong> ${orderData.paymentMethod}</p>
                <p style="margin:0;"><strong>Status:</strong> ${orderData.paymentStatus}</p>
              </div>
            </div>

            <div class="section" style="background:#f8fafc; border-style:dashed;">
              <div class="section-title">Need help?</div>
              <p style="margin:0 0 6px;"><a href="https://www.countrynaturalfoods.com" target="_blank">Visit Country Natural Foods</a></p>
              <p style="margin:0 0 6px;">Instagram: <a href="https://www.instagram.com/countrynaturalfoods" target="_blank">@countrynaturalfoods</a></p>
              <p style="margin:0 0 6px;">Facebook: <a href="https://www.facebook.com/countrynaturalfoods" target="_blank">Country Natural Foods</a></p>
              <p style="margin:0 0 6px;">Twitter: <a href="https://www.twitter.com/cnaturalfoods" target="_blank">@cnaturalfoods</a></p>
              <p style="margin:0;">Support: <a href="mailto:support@countrynaturalfoods.com">support@countrynaturalfoods.com</a></p>
            </div>

            <div class="footer">
              <p>We appreciate your trust in Country Natural Foods.</p>
              <p>This is an automated email. Please do not reply directly.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

