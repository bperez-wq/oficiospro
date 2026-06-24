# Specialist intake operations

## Objetivo

Convertir intentos de postulacion especialista en una cola diaria de seguimiento. La regla operacional es simple: si una persona dejo email o telefono, OficiosPro debe poder verla, priorizarla y contactarla rapido aunque no haya completado todo el perfil.

## Reporte diario

Generar reporte con datos reales:

```powershell
cd C:\Users\Benjamin\oficiospro\oficiospro
$env:APP_BASE_URL="https://www.oficiospro.cl"
$env:ADMIN_TOKEN="VALOR_REAL_DEL_SECRETO"
npm run ops:specialist-intake
```

Salida:

```text
reports/specialist-intake/YYYY-MM-DD.md
```

El reporte no guarda nombres, telefonos ni emails. Solo deja:

- ID de lead
- edad del lead
- estado
- etapa
- oficio
- comuna
- canales disponibles
- accion recomendada

## Fuente local

Tambien puede usarse un export local sin token:

```powershell
$env:SPECIALIST_INTAKE_INPUT="reports/business-health/input/leads.json"
npm run ops:specialist-intake
```

## Metricas principales

- leads especialista reales
- intentos capturados
- intentos abiertos
- postulaciones completas detectadas
- seguimientos abiertos
- primer contacto pendiente
- vencidos 24 h
- vencidos 72 h
- fallos de email
- tests excluidos

## Playbook diario

1. Abrir `/admin/leads`.
2. Filtrar por `specialist_application`.
3. Revisar primero los vencidos 24 h.
4. Contactar por telefono/WhatsApp cuando exista telefono.
5. Si solo existe email, enviar correo corto de recuperacion.
6. Cambiar estado despues del contacto.
7. Si supera 72 h sin respuesta, decidir rescate o cierre.
8. No contar datos con badge `Test` como traccion real.

## Seguridad de datos

- No escribir tokens en archivos.
- No commitear reportes con datos personales.
- El reporte generado por este script evita PII por defecto.
- Si se necesita contactar, usar `/admin/leads` con `ADMIN_TOKEN`, no el archivo del repo.

## Relacion con salud del modelo

Este reporte complementa `scripts/generate-business-health-report.mjs`. El reporte de salud muestra si la plataforma acumula traccion; este reporte muestra que hacer hoy con las oportunidades abiertas.
