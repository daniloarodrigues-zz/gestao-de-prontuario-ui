import { Component, OnInit, Inject } from '@angular/core';
import { ErrorHandlerService } from 'app/core/error-handler.service';
import { NotificationsComponent } from 'app/core/notification/notifications.component';
import { PatientService } from '../patient.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AddressService } from 'app/core/address.service';
import { UtilService } from 'app/core/util.service';

export class Address {
  constructor() { }
  street: string = null;
  city: string = null;
  state: string = null;
  postalCode: string = null;
  addressNumber: string = null;
  complement: string = null;
  district: string = null;
}

export class Document {
  constructor(type) {
    this.type = type;
  }
  type: string; // CPF, CNPJ, PASSAPORTE, RNE
  value: string; // Valor do documento
}
export class Patient {
  id: number;
  firstName: string;
  lastName: string;
  fatherName: string;
  motherName: string;
  identity: string;
  dispatcher: string;
  document?: Document = new Document('CPF');
  address?: Address = new Address();
  principalNumber: string;
  secondaryNumber: string;
  bornDate: Date;
  observations: string;
  gender: string;
  email: string;
}

@Component({
  selector: 'app-patient-edit',
  templateUrl: './patient-edit.component.html'
})
export class PatientEditComponent implements OnInit {

  public patient: Patient;
  public loading: boolean;

  constructor(
    public dialogRef: MatDialogRef<PatientEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Patient, private patientService: PatientService, private addressService: AddressService, private notification: NotificationsComponent, private utilService: UtilService) {
    this.dialogRef.disableClose = true;

    this.patient = new Patient();

  }

  ngOnInit() {
    if(this.dialogRef.componentInstance.data['selectedPatient'] !== null) {
      var selectedPatientId = this.dialogRef.componentInstance.data['selectedPatient'];
      this.patientService.getById(selectedPatientId).then(resp => {
        this.loading = false;
        console.log(this.patient);
        this.patient = resp;
        if (!resp.address) {
          this.patient.address = new Address();
        }
      }).catch(error => {
        this.loading = false;
        var cpf = this.patient.document.value;
        this.patient = new Patient();
        this.patient.document.value = cpf;
      });
    }
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  save() {
    if (this.patient.id) {

    } else {
      this.patientService.create(this.patient).then(resp => {
        this.patient = resp;
        if (!resp.address) {
          this.patient.address = new Address();
        }

      }).catch(error => {
        this.loading = false;
      });
    }
  }

  searchAddressByCEP() {
    this.loading = true;
    this.addressService.getAddressByCep(this.patient.address.postalCode).then(address => {
      this.loading = false;
      this.patient.address.city = address.localidade;
      this.patient.address.district = address.bairro;
      this.patient.address.state = address.uf;
      this.patient.address.street = address.logradouro;
    }).catch(error => {
      this.loading = false;
      this.notification.showWarning("Não foi possível realizar a busca do CEP, verifique se o mesmo está correto e continue o cadastro normalmente.")
    });
  }

  selectGender(newValue) {
    this.patient.gender = newValue;
  }

  selectState(newValue) {
    this.patient.address.state = newValue;
  }

  searchPatientByCpf() {
    if (!this.utilService.cpfIsValid(this.patient.document.value)) {
      this.notification.showError("CPF Inválido, favor informar um CPF válido e sem pontos e/ou traços");
      this.patient = new Patient();
    } else {
      this.loading = true;
      this.patientService.getByCpf(this.patient.document.value).then(resp => {
        this.loading = false;
        console.log(this.patient);
        this.patient = resp;
        if (!resp.address) {
          this.patient.address = new Address();
        }
      }).catch(error => {
        this.loading = false;
        var cpf = this.patient.document.value;
        this.patient = new Patient();
        this.patient.document.value = cpf;
      });
    }
  }
}