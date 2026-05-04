# Flujo de registro

Esta guia explica como se registra un cliente en el storefront y donde mirar si algo falla.

## 1. Configuracion del tenant

La app carga la configuracion desde `GET /api/accounts/{account_id}/ecommerce-config`. Para el registro, la parte importante es `registration.fields`.

Cada campo puede definir:

- `name`: nombre tecnico que usa el formulario.
- `label`: texto visible para el usuario.
- `placeholder`: ayuda dentro del input.
- `required`: si el usuario debe completarlo cuando se muestra.
- `visible`: si aparece o queda oculto.
- `type`: tipo de input, por ejemplo `password`, `email` o `text`.

El contrato exige que `email` y `password` esten disponibles para que el usuario pueda crear e iniciar sesion.

## 2. Render del formulario

El formulario vive en `src/pages/Register.tsx`.

El componente toma `getRegistrationConfig()` y recorre `registrationConfig.fields`. Solo renderiza los campos donde `visible !== false`.

La validacion tambien se arma desde la misma configuracion:

- `email` usa `buildEmailSchema()`.
- `password` usa `buildPasswordSchema()`.
- Los demas campos visibles usan `required` para decidir si deben completarse.
- `acceptTerms` siempre se valida porque no depende del backend.

## 3. Payload que se envia

Antes de llamar al backend, `Register.tsx` usa `buildRegisterDataFromForm()` de `src/features/auth/registrationPayload.ts`.

Ese helper resuelve dos casos:

- Si el usuario completo un campo visible, se manda ese valor.
- Si un campo esta oculto o no esta en el formulario pero el backend necesita un string, se manda un valor valido de fallback.

Los campos minimos del backend son:

- `first_name`
- `last_name`
- `email`
- `company_name`
- `password`

Por eso, si `first_name`, `last_name` o `company_name` no se muestran, el helper completa valores como `Cliente`, `Ecommerce` y `Cliente Ecommerce` para que el registro no falle por strings vacios.

## 4. Servicio de auth

`src/services/authService.ts` transforma el payload del formulario al contrato real de la API:

- `firstName` pasa a `first_name`.
- `lastName` pasa a `last_name`.
- `companyName` pasa a `company_name`.
- `taxId` pasa a `tax_id`.
- `personMetadata` pasa a `person_metadata`.
- `companyMetadata` pasa a `company_metadata`.

El endpoint usado es `POST /api/simple/register-customer`, definido en `src/config/api.ts` y aprobado en `docs/BACKEND_CONTRACT.md`.

## 5. Despues del registro

Si el registro fue exitoso, `authService.register()` llama a `login()` con el email y password del usuario. Asi el cliente queda autenticado sin tener que volver a escribir sus credenciales.

Luego se guardan datos utiles para el resto de la app:

- Token de sesion en el cliente HTTP.
- `business_partner_id` cuando el backend lo devuelve.
- Draft de registro para prellenar checkout.
- Estado global de usuario en `useStore`.

## 6. Tests importantes

El archivo `src/features/auth/registrationPayload.test.ts` cubre el comportamiento mas delicado: campos ocultos y valores de fallback.

Si cambias nombres de campos, validaciones o contrato de registro, actualiza esos tests primero para documentar el comportamiento esperado.
