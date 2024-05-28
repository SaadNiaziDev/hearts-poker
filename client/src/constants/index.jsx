import Swal from 'sweetalert2';
// export const baseURL = "http://localhost:8000"
// export const apiURL = "http://localhost:8000/api"
export const dippies_contract_address = '0x82F5eF9dDC3D231962Ba57A9c2eBb307Dc8d26c2'
export const gay_aliens_contract_address = '0x626a67477D2DCa67cAC6d8133f0F9dadDBFEA94e'
export const Toast = Swal.mixin( {
    toast: true,
    position: 'top-end',
    iconColor: 'white',
    customClass: {
        popup: 'colored-toast'
    },
    showConfirmButton: false,
    timer: 3000,

    timerProgressBar: true,
} )

export const baseURL = "http://3.87.232.122"
export const apiURL = "http://3.87.232.122/api"


