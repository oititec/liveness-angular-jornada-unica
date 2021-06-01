import { Component, OnInit, OnDestroy } from '@angular/core';
import adapter from 'webrtc-adapter';
import { FacecaptchaService } from '../../services/facecaptcha.service';
import { FacecaptchaBackendService } from '../../backend/facecaptcha-backend.service';
import { switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-liveness',
  templateUrl: './liveness.component.html',
  styleUrls: ['./liveness.component.css']
})
export class LivenessComponent implements OnInit {
	private streams: any;

	cliente = {
		cpf: '00000014141',
		nome: 'Nome Sobrenome',
		nascimento: '01/01/2001'
	};

	private appkey: any;
	private challenge: any;
	private fcvarFirstSnap: any;
	private fcvarSnaps: any = '';

	private msgBase64 = '';
	private emojiBase64 = '';
	private message = 'Clique em INICIAR';

	private showIniciar = true;
	private isLoaded = false;

	constructor(
		private facecaptchaService: FacecaptchaService,
		private facecaptchaBackendService: FacecaptchaBackendService,
    private router: Router
	) {}

	ngOnInit() {
		this.startCamera();
	}

	ngOnDestroy() {
		this.stopCameraStreams();
	}

	startCamera() {
		navigator.getUserMedia =
			(navigator as any).getUserMedia ||
			(navigator as any).webkitGetUserMedia ||
			(navigator as any).mozGetUserMedia ||
			(navigator as any).msGetUserMedia ||
			(navigator as any).mediaDevices.getUserMedia;

		// ajusta as configurações de video
		const constraints: any = {
			audio: false,
			video: {
				width: { exact: 640 },
				height: { exact: 480 }
			}
		};

		// se mobile, ajusta configurações de video para mobile
		if (this.isMobile()) {
			constraints.video = {
				width: { exact: 1280 },
				height: { exact: 720 },
				facingMode: 'user'
			};
		}

		// verifica suporte a getUserMedia
		if (navigator.getUserMedia) {
			navigator.mediaDevices
				.getUserMedia(constraints)
				.then((stream) => this.handleStream(stream))
				.catch((err) => {
					console.log('No camera! ' + err);
				});
		} else {
			console.log('getUserMedia not supported');
		}
	}

	stopCameraStreams() {
		if (this.streams) {
			this.streams.forEach((stream) => {
				stream.stop();
			});
			this.streams = null;
		}
	}

	private handleStream(stream: any) {
		const video: any = document.getElementById('player');

		video.setAttribute('autoplay', '');
		video.setAttribute('muted', '');
		video.setAttribute('playsinline', '');

		video.srcObject = stream;
		this.streams = stream.getVideoTracks();
	}

	startCapture() {
		this.showIniciar = false;
		this.isLoaded = true;
		this.message = 'Iniciando...';

		this.facecaptchaBackendService
			.gerarAppkey(this.cliente)
			.pipe(
				tap((result: any) => (this.appkey = result.body.appkey)),
				switchMap((result) => this.facecaptchaService.startChallenge(this.appkey))
			)
			.subscribe(
				(response: any) => {
					this.challenge = this.facecaptchaService.decryptChallenge(response.body, this.appkey);
					this.isLoaded = false;
					this.prepareChallenge(0);
				},
				(error) => {
					console.log(error);
					this.isLoaded = false;
				}
			);
	}

	// Preparar desafios
	prepareChallenge(index) {
		var me = this;

		this.emojiBase64 = '';
		this.msgBase64 = '';
		this.message = '';

		if (index >= this.challenge.numberOfChallenges) {
			this.stopChallenge();
			return;
		}

		// Intervalo de captura de image do video
		for (let i = 1; i <= this.challenge.snapNumber; i++) {
			setTimeout(function() {
				console.log(index + ' - snap: ' + i);
				me.snapTick(me.challenge.challenges[index]);
			}, this.challenge.snapFrequenceInMillis * i);
		}

		// atribui imagem Desafio (msg)
		this.msgBase64 = 'data:image/jpeg;base64,' + this.challenge.challenges[index].mensagem;

		// atribui imagem Desafio (emojji)
		this.emojiBase64 = 'data:image/jpeg;base64,' + this.challenge.challenges[index].tipoFace.imagem;

		setTimeout(function() {
			// Proximo desafio. Recursive
			index++;
			me.prepareChallenge(index);
		}, this.challenge.totalTime / this.challenge.numberOfChallenges * 1000);
	}

	// finaliza desafios
	stopChallenge() {
		this.message = 'Enviando...';
		this.isLoaded = true;
		this.stopCameraStreams();

		this.facecaptchaService
			.captcha(this.appkey, this.challenge.chkey, this.fcvarSnaps)
			.subscribe(
				(response: any) => {
					// console.log(response);
					// this.message = response.body.cause;
					// this.isLoaded = false;
          this.router.navigate(['/send-document'], {queryParams: {"appKey": this.appkey}, skipLocationChange: true})
				},
				(error) => {
					console.log(error);
				}
			);
	}

	// prepara captura de imagem
	snapTick(fcvarCurCha) {
		let snapb64: any = this.snap();

		if (this.fcvarFirstSnap === '') {
			this.fcvarFirstSnap = snapb64;
		}

		// necessario adicionar o codigo do tipoFace entre o 'data:image/jpeg' e o snapb64
		snapb64 = snapb64.split('data:image/jpeg;base64,');
		snapb64 = 'data:image/jpeg;base64,' + snapb64[0] + 'type:' + fcvarCurCha.tipoFace.codigo + ',' + snapb64[1];

		this.fcvarSnaps += snapb64;
	}

	// captura imagem da câmera
	snap() {
		const video: any = document.getElementById('player');
		var canvas: any = document.getElementById('fc_canvas');
		var ctx = canvas.getContext('2d');

		ctx.canvas.width = 320;
		ctx.canvas.height = 480;

		var ratio = video.videoWidth / video.videoHeight;
		var widthReal,
			heightReal = 0;
		var startX,
			startY = 0;

		if (ratio >= 1) {
			// paisagem
			widthReal = video.videoHeight / 1.5;
			heightReal = video.videoHeight;

			startX = (video.videoWidth - widthReal) / 2;
			startY = 0;
		} else {
			// retrato
			ratio = video.videoHeight / video.videoWidth;

			// verifica proporção
			if (ratio > 1.5) {
				widthReal = video.videoWidth;
				heightReal = video.videoWidth * 1.5;

				startX = 0;
				startY = (video.videoHeight - heightReal) / 2;
			} else {
				widthReal = video.videoHeight / 1.5;
				heightReal = video.videoHeight;

				startX = (video.videoWidth - widthReal) / 2;
				startY = 0;
			}
		}

		// crop image video
		ctx.drawImage(video, startX, startY, widthReal, heightReal, 0, 0, ctx.canvas.width, ctx.canvas.height);

		var img = new Image();
		img.src = canvas.toDataURL('image/jpeg');

		return img.src;
	}

	private isMobile() {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}
}

