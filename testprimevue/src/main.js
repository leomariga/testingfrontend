import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import App from './App.vue';
import router from './router';

// PrimeVue Components
import PrimeSidebar from 'primevue/sidebar';
import PrimeMenu from 'primevue/menu';
import PrimeButton from 'primevue/button';

// Icons
import 'primeicons/primeicons.css';

const app = createApp(App);

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

// Register PrimeVue components
app.component('PrimeSidebar', PrimeSidebar);
app.component('PrimeMenu', PrimeMenu);
app.component('PrimeButton', PrimeButton);

app.mount('#app');




