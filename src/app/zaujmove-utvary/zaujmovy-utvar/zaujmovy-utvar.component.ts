import { Veduci } from 'src/app/domain/veduci';
import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';

import { DataService } from '../../service/data.service';
import { BaseComponent } from '../../base.component';
import { IZaujmovyUtvar } from './../../domain/zaujmovy-utvar';
import { ZaujmovyUtvarValidator } from 'src/app/validation/zaujmovy-utvar.validator';

declare var jQuery: any;

@Component({
  selector: 'app-miesto',
  templateUrl: './zaujmovy-utvar.component.html',
  styleUrls: ['./zaujmovy-utvar.component.scss']
})
export class ZaujmovyUtvarComponent extends BaseComponent implements OnInit, AfterViewChecked {
  @ViewChild('vodca') vodca: ElementRef;
  
  formular: FormGroup;
  submitnuty: boolean;

  vodcovia: Veduci[];

  constructor(
    protected fb: FormBuilder,
    protected router: Router,
    protected activatedRoute: ActivatedRoute,
    protected location: Location,
    protected dataService: DataService
  ) {
    super(router, dataService);
    this.setTitle('Záujmový útvar', 'red');

    this.formular = this.fb.group(
      {
        id: [null],
        nazov: [
          null,
          [
            Validators.required,
            Validators.minLength(3)
          ]
        ],
        veduci: [null, Validators.required]
      },
      { validator: ZaujmovyUtvarValidator.createDuplicateValidator(this.dataService) }
    );
  }

  ngOnInit() {    
    this.dataService.sortVeduci();
    this.vodcovia = this.dataService.veduci;
    this.initData();

    // init dropdown
    jQuery(this.vodca.nativeElement).dropdown();
  }

  ngAfterViewChecked() {
    jQuery(this.vodca.nativeElement).dropdown('set selected', this.formular.get('veduci').value);
  }

  get f() {
    return this.formular.controls;
  }

  protected getData(): any {
    let id: string = this.activatedRoute.snapshot.paramMap.get('id');
    let zaujmovyUtvar: IZaujmovyUtvar = {
      id: null,
      nazov: '',
      veduci: {
        id: null
      }
    };

    if (id != 'plus') {
      zaujmovyUtvar = this.dataService.findZaujmovyUtvar(id);
      if (zaujmovyUtvar) {
        this.log('nastavujem veduceho: ' + zaujmovyUtvar.veduci.id);
        this.formular.setValue({
          id: zaujmovyUtvar.id,
          nazov: zaujmovyUtvar.nazov,
          veduci: zaujmovyUtvar.veduci.id ? zaujmovyUtvar.veduci.id : ''
        });
      }
    }
    return zaujmovyUtvar;
  }

  submit() {
    this.submitnuty = true;
    if (this.formular.valid) {
      if (
        this.formular.get('id').value == null ||
        this.formular.get('id').value == ''
      ) {
        this.log('pridavam zaujmovy utvar: ' + this.formular.get('nazov').value);
        this.dataService.insertZaujmovyUtvar(this.formular.value).then(_ => {
          swal(`Záujmový útvar úspešne pridaný.`, {
            icon: 'success'
          }).then(_ => {
            this.formular.reset();
            this.formular.setValue({
              id: null,
              nazov: '',
              veduci: null
            });
            jQuery(this.vodca.nativeElement).dropdown('clear');
            this.submitnuty = false;
          });
        });
      } else {
        this.log('aktualizujem zaujmovy utvar: ' + this.formular.get('nazov').value);
        this.dataService.updateZaujmovyUtvar(this.formular.value).then(_ => {
          swal('Záujmový útvar úspešne upravený.', {
            icon: 'success'
          }).then(_ => {
            this.submitnuty = false;
          });
        });
      }
    }
  }

  goBack(): void {
    this.location.back();
  }
}