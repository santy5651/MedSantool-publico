'use client';

import React from 'react';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Info,
  Rocket,
  HelpCircle,
  AlertTriangle,
  Mail,
  Link as LinkIcon,
  Lightbulb,
  FileText,
  ClipboardEdit,
  Stethoscope,
  ListChecks,
  FileEdit as MedicalOrdersIcon,
  UserCheck,
  FileOutput,
  Bot
} from 'lucide-react';
import { Alert } from '@/components/ui/alert';

export default function HelpPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
          Centro de Ayuda de MedSanTools
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Todo lo que necesita saber para empezar a usar la plataforma.
        </p>
      </header>

      <Accordion type="multiple" defaultValue={['introduction']} className="w-full max-w-4xl mx-auto">
        {/* Section 1: Introduction */}
        <AccordionItem value="introduction">
          <AccordionTrigger className="text-xl font-headline">
            <Info className="mr-3 h-6 w-6 text-accent" />
            Introducción a MedSanTools
          </AccordionTrigger>
          <AccordionContent className="px-2 pt-2">
            <p className="text-base mb-4">
              <strong>MedSanTools</strong> es una plataforma de software inteligente diseñada para asistir a profesionales de la salud en sus tareas clínicas diarias. Nuestro objetivo es optimizar flujos de trabajo, mejorar la calidad de la documentación y proporcionar un soporte avanzado para la toma de decisiones, permitiéndole dedicar más tiempo a lo que realmente importa: sus pacientes.
            </p>
            <p className="text-base">
              Está dirigida a médicos, residentes, especialistas y estudiantes de medicina que buscan una herramienta para agilizar procesos como la redacción de notas, el análisis de paraclínicos y la generación de documentos clínicos.
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* Section 2: Quick Start Guide */}
        <AccordionItem value="quick-start">
          <AccordionTrigger className="text-xl font-headline">
            <Rocket className="mr-3 h-6 w-6 text-accent" />
            Guía Rápida de Uso por Módulos
          </AccordionTrigger>
          <AccordionContent className="px-2 pt-2 space-y-4">
            <p>El flujo de trabajo ideal en MedSanTools sigue una secuencia lógica. Comience con los módulos de entrada de datos y avance hacia los de análisis y generación de documentos.</p>
            
            <Card>
              <CardHeader><CardTitle className="flex items-center text-lg"><ClipboardEdit className="mr-2 h-5 w-5"/>1. Mejora de Redacción Médica</CardTitle></CardHeader>
              <CardContent>
                <p>Pegue sus notas o la historia de la enfermedad actual. Haga clic en <strong>"Mejorar"</strong> para obtener un texto refinado y profesional. Este texto es la base para muchos otros módulos.</p>
                <Image src="https://placehold.co/600x300.png" alt="Screenshot del Módulo de Redacción" width={600} height={300} className="rounded-md mt-2" data-ai-hint="text editor user interface" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader><CardTitle className="flex items-center text-lg"><Lightbulb className="mr-2 h-5 w-5"/>2. Diagnóstico Inteligente</CardTitle></CardHeader>
              <CardContent>
                <p>El texto mejorado se envía aquí automáticamente. Haga clic en <strong>"Sugerir"</strong> para obtener una lista de posibles diagnósticos (CIE-10). Marque la casilla <strong>"Validar"</strong> en los diagnósticos que considere correctos.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center text-lg"><ListChecks className="mr-2 h-5 w-5"/>3. Plan Terapéutico y Órdenes</CardTitle></CardHeader>
              <CardContent>
                <p>Basándose en los diagnósticos validados, los módulos de <strong>Plan Terapéutico</strong>, <strong>Órdenes Médicas</strong> y <strong>Examen Físico</strong> se pre-llenarán con contexto. Utilícelos para generar planes de tratamiento, órdenes hospitalarias y hallazgos físicos dirigidos.</p>
                <Image src="https://placehold.co/600x300.png" alt="Screenshot de los Módulos de Generación" width={600} height={300} className="rounded-md mt-2" data-ai-hint="medical form application" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center text-lg"><UserCheck className="mr-2 h-5 w-5"/>4. Documentos de Egreso</CardTitle></CardHeader>
              <CardContent>
                <p>Finalmente, use los módulos de <strong>Consejos para Paciente</strong> y <strong>Resumen de Egreso</strong> para generar toda la documentación de salida de forma rápida y estructurada.</p>
              </CardContent>
            </Card>
            
          </AccordionContent>
        </AccordionItem>

        {/* Section 3: FAQ */}
        <AccordionItem value="faq">
          <AccordionTrigger className="text-xl font-headline">
            <HelpCircle className="mr-3 h-6 w-6 text-accent" />
            Preguntas Frecuentes (FAQ)
          </AccordionTrigger>
          <AccordionContent className="px-2 pt-2 space-y-4">
             <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">¿Dónde se guarda mi API Key?</CardTitle></CardHeader>
                <CardContent><p className="text-sm">Su API Key se almacena exclusivamente en el <strong>localStorage de su navegador</strong>. Nunca se envía a nuestros servidores ni se guarda en el código fuente. Es segura y local en su máquina.</p></CardContent>
            </Card>
             <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">¿Se guardan los datos de mis pacientes en algún lugar?</CardTitle></CardHeader>
                <CardContent><p className="text-sm">No. Todos los datos que usted ingresa se procesan en el momento y no se almacenan de forma persistente en ningún servidor. El <strong>Historial de Trabajo</strong>, si está activado, se guarda localmente en su navegador usando IndexedDB, una base de datos de su navegador a la que solo usted tiene acceso.</p></CardContent>
            </Card>
             <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">¿Puedo usar esto para tomar decisiones clínicas finales?</CardTitle></CardHeader>
                <CardContent><p className="text-sm"><strong>No.</strong> MedSanTools es una herramienta de <strong>soporte y asistencia</strong>. No reemplaza el juicio clínico profesional. Todas las sugerencias y datos generados por la IA deben ser revisados, validados y, si es necesario, corregidos por un profesional de la salud calificado antes de ser utilizados en la atención de un paciente real.</p></CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Section 4: Limitations */}
        <AccordionItem value="limitations">
          <AccordionTrigger className="text-xl font-headline">
            <AlertTriangle className="mr-3 h-6 w-6 text-accent" />
            Limitaciones y Advertencias
          </AccordionTrigger>
          <AccordionContent className="px-2 pt-2 space-y-2">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <CardTitle>Herramienta de Soporte, no de Diagnóstico</CardTitle>
              <p>MedSanTools está en desarrollo (Beta) y debe ser usada como una herramienta de apoyo. No es un dispositivo médico certificado y no debe ser utilizada para diagnósticos o tratamientos definitivos sin supervisión profesional.</p>
            </Alert>
            <p>La precisión de las respuestas de la IA puede variar. Verifique siempre la información crítica.</p>
            <p>La IA puede generar información incorrecta o sesgada ("alucinaciones"). Utilice siempre su juicio clínico.</p>
          </AccordionContent>
        </AccordionItem>

        {/* Section 5: Contact */}
        <AccordionItem value="contact">
          <AccordionTrigger className="text-xl font-headline">
            <Mail className="mr-3 h-6 w-6 text-accent" />
            Contacto y Soporte
          </AccordionTrigger>
          <AccordionContent className="px-2 pt-2">
            <p>Actualmente, el soporte se maneja a través del repositorio del proyecto. Para reportar errores, sugerir nuevas funcionalidades o contactar con el desarrollador, por favor visite nuestro GitHub (próximamente).</p>
          </AccordionContent>
        </AccordionItem>

        {/* Section 6: Useful Links */}
        <AccordionItem value="links">
          <AccordionTrigger className="text-xl font-headline">
            <LinkIcon className="mr-3 h-6 w-6 text-accent" />
            Enlaces Útiles
          </AccordionTrigger>
          <AccordionContent className="px-2 pt-2">
            <p>Próximamente se añadirán enlaces a recursos relevantes, guías clínicas y más.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
