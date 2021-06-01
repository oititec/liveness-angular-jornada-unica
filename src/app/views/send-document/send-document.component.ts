import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import adapter from 'webrtc-adapter';
import { FacecaptchaService } from '../../services/facecaptcha.service';
// import { FacecaptchaBackendService } from './backend/facecaptcha-backend.service';
import { switchMap, tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-send-document',
  templateUrl: './send-document.component.html',
  styleUrls: ['./send-document.component.css']
})
export class SendDocumentComponent implements OnInit {
  private streams: any;

  private appkey = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJjZXJ0aWZhY2UiLCJ1c2VyIjoiOUQ0RUM5ODI0RDA1QUMwRjQ1NjM1QTFGMUUxMDdGQ0FBOEN8Y2FybG9zLnRpcnJlbGwiLCJlbXBDb2QiOiIwMDAwMDAwMDAxIiwiZmlsQ29kIjoiMDAwMDAwMjQ5MyIsImNwZiI6IjA3NjM5MDc3NjY0Iiwibm9tZSI6IjU1MzZDNkNGQjU1MjkyMDJFODE1OTNBODQxMDAwODhCMjU4MkM3NjAyOTUwQ0M5NERCNjdCQzlBRjI1OTk1OTlCOEI5NTE0NjlGQjVDOTA5OEY1RDA3MDMwRUI4NjdGMjE4RUEyMjNEQjlCNTVDMzI3MHxDQVJMT1MgQ0VTQVIgR09NRVMgRE9TIFNBTlRPUyBGSUxITyIsIm5hc2NpbWVudG8iOiIxMi8wNC8xOTg4IiwiZWFzeS1pbmRleCI6IkFBQUFFcEQzM2R0WnJ2d3A4eFZVV0FndzZwdVV0WUNVcm0xUVZvLzF3VXZZeEJMaU50eTlDYmVsWHVFanZBPT0iLCJrZXkiOiJRV3hzYjNkaGJtTmxJSEpsY0hWc2MybDJaU0J6WlhnZ2JXRjVJR052Ym5SaGFXND0iLCJleHAiOjE2MTc5NzczOTAsImlhdCI6MTYxNzk3NzA5MH0.M0_irbFYT-l8PkuK8_msCAHl-cHwW7_mWLAWaR_omJU';
  private snapsCaptures: any = [];
  private snapTempDOM: any = '';
  private message = '';

  private showTypeCapture = true;
  private multiCapture = false;
  private showIniciar = false;
  private showUpload = false;
  private isLoaded = false;
  private rotateCamera = false;
  private btnControllers = false;
  private processing = false;
  private indexTempSnap = -1;
  private showDesktop = false;
  private uploadRequest = false;
  private uploadResp = true;

  constructor(
    private domSanitizer: DomSanitizer,
    private facecaptchaService: FacecaptchaService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.showDesktop = !this.isMobile();
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      if(!params['appKey']) {
        this.router.navigate(['/']);
      } else {
        this.appkey = params['appKey'];
      }
    });    
  }

  ngOnDestroy() {
    this.stopCameraStreams();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    if (!this.showTypeCapture && !this.processing && this.multiCapture && !this.showDesktop) {
      this.stopCameraStreams();
      if (window.innerWidth > window.innerHeight) {
        this.rotateCamera = false;
        this.message = '';
        if (!this.btnControllers && !this.showUpload) {
          this.startCamera();
        }
      } else {
        this.rotateCamera = true;
        this.message = '';
        this.isLoaded = false;
      }
    } else if (!this.showTypeCapture && !this.processing && !this.multiCapture && !this.showDesktop) {
        if (window.innerWidth > window.innerHeight && window.innerWidth  < 1440 && !this.showDesktop) {
          this.rotateCamera = true;
          this.message = '';
          this.isLoaded = false;
        } else {
          this.rotateCamera = false;
          this.message = '';
          if (!this.btnControllers && !this.showUpload) {
            this.startCamera();
          }
        }
    } else if (this.showDesktop) {
      this.rotateCamera = false;
      this.message = '';
      if (!this.btnControllers && !this.showUpload) {
        this.startCamera();
      }
    }
    else if (this.processing) {
      if (this.multiCapture) {
        if (window.innerWidth < window.innerHeight) {
          this.rotateCamera = true;
        } else {
          this.rotateCamera = false;
        }
      } else {
        if (!this.showDesktop) {
          if (window.innerWidth < window.innerHeight) {
            this.rotateCamera = false;
          } else {
            this.rotateCamera = true;
          }
        }
      }
    }
  }

  // Volta para tela de seleção da quantidade de fotos à capturar
  backSetTypeCapture() {
    this.uploadRequest = false;
    this.btnControllers = false;
    this.showTypeCapture = true;
    this.showIniciar = false;
    this.showUpload = false;
    this.snapsCaptures = [];
    this.stopCameraStreams();
  }

  // Seleciona a quantidade de fotos que vai capturar
  setTypeCapture(type) {
    if (type === 1) {
      this.multiCapture = false;
      this.showTypeCapture = false;
      this.onResize();
    } else {
      this.multiCapture = true;
      this.showTypeCapture = false;
      this.onResize();
    }
  }

  // Abertura da câmera
  startCamera() {
    if (this.multiCapture) {
      if (this.indexTempSnap !== -1 ) {
        this.message = this.indexTempSnap === 1 ? 'Centralize o verso do documento' : 'Centralize a frente do documento';
      } else {
        this.message = this.snapsCaptures.length === 0 ? 'Centralize a frente do documento' : 'Centralize o verso do documento';
      }
    } else {
      this.message = 'Centralize o documento';
    }
    this.showIniciar = false;
    this.isLoaded = true;
    this.processing = true;
    setTimeout(() => {
      this.showIniciar = true;
      this.isLoaded = false;
      this.message = '';
      this.processing = false;
    }, 3000);

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
        facingMode: 'environment',
        width: { exact: 640 },
        height: { exact: 480 }
      }
    };

    // se mobile, ajusta configurações de video para mobile
    if (this.isMobile()) {
      constraints.video = {
        width: { exact: 1280 },
        height: { exact: 720 },
        facingMode: 'environment'
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

  private handleStream(stream: any) {
    const video: any = document.getElementById('player');

    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');

    video.srcObject = stream;
    this.streams = stream.getVideoTracks();
  }

  // Fecha a câmera
  stopCameraStreams() {
    if (this.streams) {
      this.streams.forEach((stream) => {
        stream.stop();
      });
      this.streams = null;
    }
  }

  async startCapture() {
    this.processing = true;
    this.snapCapture();
    this.message = 'Processando';
    this.showIniciar = false;
    this.isLoaded = true;
    this.stopCameraStreams();
    setTimeout(() => {
      this.message = '';
      this.btnControllers = true;
      this.isLoaded = false;
      this.processing = false;
    }, 3000);
  }

   // Limpa as listar e reinicia a Câmera
   resetSnap() {
    this.snapTempDOM = '';
    this.btnControllers = false;
    if (this.multiCapture) {
      if (this.snapsCaptures.length < 2) {
        this.startCamera();
      } else {
        this.showUpload = true;
        this.stopCameraStreams();
      }
    } else {
      if (this.snapsCaptures.length < 1) {
        this.startCamera();
      } else {
        this.showUpload = true;
        this.stopCameraStreams();
      }
    }
  }

  // captura imagem para validação do usuário
  snapCapture() {
    this.snapTempDOM = this.snap();
  }

  // prepara captura de imagem
  snapTick() {
    // Adiciona as fotos nas listas
    if (this.indexTempSnap !== -1) {
      this.snapsCaptures.splice(this.indexTempSnap, 0, this.snapTempDOM);
    } else {
      this.snapsCaptures.push(this.snapTempDOM);
    }
    this.indexTempSnap = -1;
    // Limpa as listas e reinicia a câmera
    this.resetSnap();
  }

  // captura imagem da câmera
  snap() {
    const video: any = document.getElementById('player');
    const canvas: any = document.getElementById('fc_canvas');
    const ctx = canvas.getContext('2d');

    let ratio = video.videoWidth / video.videoHeight;
    let widthReal = 0;
    let heightReal = 0;
    let startX = 0;
    let startY = 0;

    if (ratio >= 1 && !this.showDesktop) {
      ctx.canvas.width = 1280;
      ctx.canvas.height = 768;
      widthReal = video.videoWidth;
      heightReal = video.videoHeight;
      startX = 0;
      startY = 0;
    } else {
      // retrato
      ctx.canvas.width = 640;
      ctx.canvas.height = 960;
      ratio = video.videoHeight / video.videoWidth;
      // verifica proporção
      if (ratio > 1.5) {
        widthReal = video.videoWidth;
        heightReal = video.videoHeight;
        startX = 0;
        startY = 0;
      } else {
        widthReal = video.videoHeight / 1.5;
        heightReal = video.videoHeight;
        startX = (video.videoWidth - widthReal) / 2;
        startY = 0;
      }
    }

    // crop image video
    ctx.drawImage(video, startX, startY, widthReal, heightReal, 0, 0, ctx.canvas.width, ctx.canvas.height);

    const img = new Image();
    img.src = canvas.toDataURL('image/jpeg');
    return img.src;
  }

  // remove imagem das listas
  removeSnapFromLists(index) {
    this.indexTempSnap = index;
    this.snapsCaptures.splice(index, 1);
    this.showUpload = false;
    this.resetSnap();
  }

  // Envia as fotos e finaliza o upload de imagens
  uploadPictures() {
    const snapsSend =  this.snapsCaptures.map(snap => snap.replace('data:image/jpeg;base64,', '')); 
    this.facecaptchaService
      .sendDocument(this.appkey, snapsSend).subscribe(
        (response: any) => {
          this.uploadRequest = true;
          this.uploadResp = true;
          console.log(response);
          this.message = 'Documento enviado com sucesso';
        },
        (error) => {
          this.uploadRequest = true;
          this.uploadResp = false;
          console.log(error);
          this.message = 'Documento não enviado, favor entrar em contato com o suporte';
        }
      );
  }

  private isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
}
