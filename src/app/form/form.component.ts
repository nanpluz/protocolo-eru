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
import { Candidate } from './Candidate';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { RecaptchaModule } from 'ng-recaptcha-19';
import { QuillModule } from 'ngx-quill';
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

  form: Partial<Candidate> = {};

  attendant: string | null = null;
  attendants = ['Fabricio', 'Leo', 'Eduardo', 'Julia', 'Juliano', 'Felipe', 'Icaro', ];

  infoSended = false;

  rate = 3;

  maximumSizeExceeded = false;

  constructor() { }

  uploadHandler($event: any) {
    let files = Array.from($event.target.files as ArrayLike<File>);
    if (!this.form.attachment) this.form.attachment = [];
    files.forEach((file: any, i: number) => { this.form.attachment!.push({ name: file.name, base64: '' }); this.fromFileToBase64(file, i) });
    this.changeDetectorRef.detectChanges();
  }

  fromFileToBase64(file: File, index: number) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => this.form.attachment![index].base64 = reader.result;
    reader.onerror = () => console.log('error');
  }

  spliceAttachment(index: number) {
    this.form.attachment!.splice(index, 1);

    this.changeDetectorRef.detectChanges();
  }

  convertAttachmentsToAPIFormat(attachments: any) {
    if (!attachments) return;
    return attachments.map((attachment: any) => { return { nome: attachment.name, arquivo: attachment.base64 } });
  }

  sendForm(args: any) {
    console.log(console.log('args', args));

    // console.log(this.form);

    // this.infoSended = false;
    // this.loading = true;
    // this.changeDetectorRef.detectChanges();

    // let body = {
    //   assunto: `Formulário de entrevista`,
    //   mensagem: `
    //     Nome: ${this.form.firstName || 'undefined'} ${this.form.lastName || 'undefined'}\n
    //     Email: ${this.form.email || 'undefined'}\n
    //     Telefone: ${this.form.phone || 'undefined'}\n
    //     Escolaridade: ${this.form.scholarity || 'undefined'}\n
    //     Status da universidade: ${this.form.universityStatus || 'undefined'}\n
    //     Disponibilidade: ${this.form.availability || 'undefined'}`,
    //   anexos: this.convertAttachmentsToAPIFormat(this.form.attachment) || []
    // }

    // this.http.post(`${environment.apiURL}/email/emailvagas`, body).toPromise().then((res) => {
    //   this.loading = false;
    //   this.infoSended = true;
    //   this.changeDetectorRef.detectChanges();
    //   console.log(res);
    // }).catch(err => {
    //   console.log(err);
    //   this.changeDetectorRef.detectChanges();
    //   this.loading = false;
    // })
  }

  submit($event: any) {
    this.loading = true;

    this.infoSended = false;
    this.loading = true;
    this.changeDetectorRef.detectChanges();

    if(this.attachmentsTrespassSizeLimit()) {
      this.loading = false;
      this.maximumSizeExceeded = true;
      this.changeDetectorRef.detectChanges();
      return;
    } else this.maximumSizeExceeded = false;

    let body = {
      captcha: $event || null,
      assunto: `Formulário de entrevista`,
      mensagem: `
        Nome: ${this.form.firstName || 'undefined'} ${this.form.lastName || 'undefined'}\n
        Email: ${this.form.email || 'undefined'}\n
        Telefone: ${this.form.phone || 'undefined'}\n
        Escolaridade: ${this.form.scholarity || 'undefined'}\n
        Status da universidade: ${this.form.universityStatus || 'undefined'}\n
        Disponibilidade: ${this.form.availability || 'undefined'}
      `,
      anexos: this.convertAttachmentsToAPIFormat(this.form.attachment) || []
    }

    this.http.post(`${environment.apiURL}/email/emailvagas`, body).toPromise().then((res) => {
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
    if (!this.form.attachment) return false;
    if (!this.form.availability) return false;
    if (!this.form.scholarity) return false;
    if (!this.form.firstName) return false;
    if (!this.form.lastName) return false;
    if (!this.form.email) return false;
    if (!this.form.phone) return false;
    return true;
  }

  attachmentsTrespassSizeLimit() {
    if (!this.form.attachment) return false;

    let sizeLimit = 10;
    let attachmentsSize = 0;

    this.form.attachment.forEach((attachment: any) => {
      let sizeInBytes = 4 * Math.ceil((attachment.base64.length / 3))*0.5624896334383812;
      let sizeInMb = (sizeInBytes / 1000) / 1000;
      attachmentsSize += sizeInMb;
    });
    
    if (attachmentsSize > sizeLimit) return true;
    return false;
  }
}
