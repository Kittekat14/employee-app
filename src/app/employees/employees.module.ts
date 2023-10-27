import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeesListComponent } from './employees-list/employees-list.component';
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: EmployeesListComponent },
  { path: 'detail/:id', component: EmployeeDetailComponent },
];

@NgModule({
  declarations: [EmployeesListComponent, EmployeeDetailComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class EmployeesModule {}
