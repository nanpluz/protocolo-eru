import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FileUploadModule } from 'primeng/fileupload';
import { BadgeModule } from 'primeng/badge';
import { MessageModule } from 'primeng/message';
import { Protocol } from './Protocol';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { RecaptchaModule } from 'ng-recaptcha-19';
import { ContentChange, QuillModule } from 'ngx-quill';
import { BarRating, BarRatingModule } from 'ngx-bar-rating';

declare global {
  interface Window {
    grecaptcha: any;
    recaptchaCallback: any;
  }
}

@Component({
  selector: 'app-form',
  imports: [RecaptchaModule, BarRatingModule, QuillModule, InputTextModule, ButtonModule, SelectModule, MultiSelectModule, FloatLabelModule, FormsModule, CommonModule, FileUploadModule, BadgeModule, MessageModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent {
  changeDetectorRef = inject(ChangeDetectorRef);
  http = inject(HttpClient);
  loading = false;

  form: Protocol = {
    attendant: '',
    customer: '',
    problem: '',
    solution: '',
    rating: 3
  };

  attendant: string | null = null;
  attendants = ['Fabricio', 'Leo', 'Eduardo', 'Julia', 'Juliano', 'Felipe', 'Icaro', ];

  infoSended = false;

  rate = 3;

  maximumSizeExceeded = false;

  constructor() { }

  convertAttachmentsToAPIFormat(attachments: any) {
    if (!attachments) return;
    return attachments.map((attachment: any) => { return { nome: attachment.name, arquivo: attachment.base64 } });
  }

  submit($event: any) {
    this.loading = true;

    this.infoSended = false;
    this.loading = true;
    this.changeDetectorRef.detectChanges();

    let body = {
      captcha: $event || null,
      assunto: `Protocolo de ${this.attendant}`,
      atendente: this.form.attendant,
      mensagem: `
        Cliente: ${this.form.customer || 'undefined'}\n
        Problema: ${this.form.problem || 'undefined'}\n
        Solução: ${this.form.solution || 'undefined'}\n
        Dificuldade: ${this.form.rating || 'undefined'}\n
      `,
      anexos: []
    }

    this.http.post(`${environment.apiURL}/email/emailprotocolos`, body).toPromise().then((res) => {
      console.log(body);
      this.loading = false;
      this.infoSended = true;
      this.changeDetectorRef.detectChanges();
      console.log(res);
    }).catch(err => {
      console.log(err);
      this.changeDetectorRef.detectChanges();
      this.loading = false;
    });
  }

  executeRecaptcha(reCaptcha: any) {
    reCaptcha.grecaptcha.execute();
  }

  everythingFilled() {
    // console.log(this.form);
    if (!this.form.attendant) return false;
    if (!this.form.customer) return false;
    if (!this.form.problem) return false;
    if (!this.form.solution) return false;
    if (!this.form.rating) return false;
    return true;
  }

  updateProblem($event: ContentChange) {
    console.log($event);
    this.form.problem = $event.html || '';
  }

  updateSolution($event: ContentChange) {
    this.form.solution = $event.html || '';
  }
}
