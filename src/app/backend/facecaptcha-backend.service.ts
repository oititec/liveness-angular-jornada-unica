import { Injectable } from '@angular/core';
import { Md5 } from 'ts-md5';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class FacecaptchaBackendService {
	private SERVER_API_URL = environment.apiUrl;

	constructor(private http: HttpClient) {}

	// Gera credencial de acesso. Deve ser feita no backend
	private credencial() {
		const login = environment.login;
		const senhaMd5 = Md5.hashAsciiStr(environment.pass).toString();
		const url = this.SERVER_API_URL + '/facecaptcha/service/captcha/credencial';

		const body = new HttpParams().set('user', login).set('pass', senhaMd5);

		const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

		return this.http.post(url, body.toString(), { headers, observe: 'response' });
	}

	// Gera appkey de acesso. Deve ser feita no backend.
	private appkey(chavePrivada, cliente) {
		const login = environment.login;
		const url = this.SERVER_API_URL + '/facecaptcha/service/captcha/appkey';

		const body = new HttpParams()
			.set('user', login)
			.set('token', JSON.stringify(chavePrivada))
			.set('cpf', cliente.cpf)
			.set('nome', cliente.nome)
			.set('nascimento', cliente.nascimento);

		const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

		console.log(cliente);
		return this.http.post(url, body.toString(), { headers, observe: 'response' });
	}

	// Retorna resultado da appkey. Deve ser feita no backend.
	result(appkey) {
		const url = this.SERVER_API_URL + '/facecaptcha/service/captcha/result';

		const body = new HttpParams().set('appkey', appkey);

		const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

		return this.http.post(url, body.toString(), { headers, observe: 'response' });
	}

  // retorna o resultado da appkey
	gerarAppkey(cliente) {
		return this.credencial().pipe(switchMap((result) => this.appkey(result.body, cliente)));
	}
}
