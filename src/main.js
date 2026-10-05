import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import ToastService from 'primevue/toastservice';

// PrimeVue & Icon Styles
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './style.css';
import 'leaflet/dist/leaflet.css';

// Components
import App from './App.vue';
import router from './router';

// Global PrimeVue Component Registrations
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Card from 'primevue/card';
import Menu from 'primevue/menu';
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressBar from 'primevue/progressbar';
import Toast from 'primevue/toast';
import Badge from 'primevue/badge';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(ToastService);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false,
    },
  },
  ripple: true,
});

// Registrar componentes UI globales para vistas y maquetas
app.component('InputText', InputText);
app.component('Password', Password);
app.component('Button', Button);
app.component('Dropdown', Dropdown);
app.component('Card', Card);
app.component('Menu', Menu);
app.component('Dialog', Dialog);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Tag', Tag);
app.component('ProgressBar', ProgressBar);
app.component('Toast', Toast);
app.component('Badge', Badge);

app.mount('#app');
