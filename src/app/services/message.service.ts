import { Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";
@Injectable({
  providedIn: "root",
})
export class MessageService {
  private static subject = new Subject<any>();

  static sendMessage(message: boolean) {
    this.subject.next(message);
  }

  static clearMessages() {
    this.subject.next();
  }

  static getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
}
