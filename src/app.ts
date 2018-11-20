import {
	Component,
	ɵrenderComponent as renderComponent,
	ɵmarkDirty as markDirty,
	ɵdetectChanges as detectChanges
} from '@angular/core';

@Component({
	selector: 'hello-world',
	template: `
	  <h1>Hello {{name}}</h1>
	  <input type="text" (input)="changeName($event.target.value)">
	`
})
export class HelloWorld {
  name = 'Worker DOM'

  constructor(){
	  console.log('created...')
  }
  changeName(name:string){
		this.name = name;
		markDirty(this);
  }
}

const host = document.createElement('hello-world');
document.body.appendChild(host);

renderComponent(HelloWorld, {host});





