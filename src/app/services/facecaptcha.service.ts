import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class FacecaptchaService {
	private SERVER_API_URL = environment.apiUrl;

	constructor(private http: HttpClient) {}
	
	// retorna os desafios. Pode ser feita no backend ou frontend.
	startChallenge(appkey) {
		const url = this.SERVER_API_URL + '/facecaptcha/service/captcha/challenge';

		const body = new HttpParams().set('appkey', appkey);

		const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

		return this.http.post(url, body.toString(), { headers, observe: 'response' });
	}

	// Descripta os desafios para Json. Pode ser feita no backend ou frontend.
	decryptChallenge(response: string, appkey: string) {
		/*
		const challengeSample = {
			chkey: 'chkeyNumber',
			totalTime: 6,
			numberOfChallenges: 2,
			snapFrequenceInMillis: 1490,
			snapNumber: 2,
			challenges: [
				{
					mensagem: 'imagBase64',
					tempoEmSegundos: 3,
					tipoFace: {
						codigo: 'cod01',
						imagem: 'imagBase64'
					}
				},
				{
					mensagem: 'imagbase64',
					tempoEmSegundos: 3,
					tipoFace: {
						codigo: 'cod02',
						imagem: 'imagBase64'
					}
				}
			]
		};
		*/
		const challenge = JSON.parse(this.decChData(response, appkey));
		
		return challenge;
	}

	// Envia imagens para o Certiface
	captcha(appkey, chkey, images) {
		const url = this.SERVER_API_URL + '/facecaptcha/service/captcha';

		const body = new HttpParams()
			.set('appkey', appkey)
			.set('chkey', chkey)
			.set('images', this.encChData(images, appkey));

		const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

		return this.http.post(url, body.toString(), { headers, observe: 'response' });
	}
  
  // Envia Documentos
  sendDocument(appkey, images) {
    return this.http.post(environment.apiUrl + '/facecaptcha/service/captcha/document', {
      'appkey': appkey,
      'images': images,
    });
  }


	/* SECURITY */
	private decChData(data: string, appkey: string) {
		const key = CryptoJS.enc.Latin1.parse(this.padKey(appkey));
		const iv = CryptoJS.enc.Latin1.parse(this.padKey(appkey.split('').reverse().join('')));
		let decripted2 = CryptoJS.enc.Utf8.stringify(
			CryptoJS.AES.decrypt(data, key, { iv: iv, padding: CryptoJS.pad.NoPadding, mode: CryptoJS.mode.CBC })
		);
		decripted2 = decripted2.substring(0, decripted2.lastIndexOf('}') + 1);
		decripted2 = decripted2.trim();
		return decripted2;
	}
	private encChData(data: string, appkey: string) {
		const key = CryptoJS.enc.Latin1.parse(this.padKey(appkey));
		const iv = CryptoJS.enc.Latin1.parse(this.padKey(appkey.split('').reverse().join('')));
		const result = CryptoJS.AES
			.encrypt(this.padMsg(data), key, { iv: iv, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC })
			.toString();
		return encodeURIComponent(result);
	}
	private padKey(source) {
		if (source.length > 16) {
			return source.substring(0, 16);
		}
		return this.padMsg(source);
	}
	private padMsg(source) {
		const paddingChar = ' ';
		const size = 16;
		const x = source.length % size;
		const padLength = size - x;
		for (let i = 0; i < padLength; i++) {
			source += paddingChar;
		}
		return source;
	}
}
