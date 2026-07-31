import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/pages/home.page/home.page').then((m) => m.HomePage),
  },
  {
    path: 'superheroes',
    loadComponent: () =>
      import('./features/superhero/pages/superhero-list/superhero-list.page/superhero-list.page').then(
        (m) => m.SuperHeroListPage,
      ),
  },
  {
    path: 'superheroes/form',
    loadComponent: () =>
      import('./features/superhero/pages/superhero-form/superhero-form.page/superhero-form.page').then(
        (m) => m.SuperHeroFormPage,
      ),
  },
  {
    path: 'superheroes/form/:id',
    loadComponent: () =>
      import('./features/superhero/pages/superhero-form/superhero-form.page/superhero-form.page').then(
        (m) => m.SuperHeroFormPage,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
