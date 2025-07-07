
'use client';

import React from 'react';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  UserCheck,
  Bot,
  Brain,
  FileEdit,
  FileOutput,
  Image as ImageIconLucide,
  FlaskConical,
  FileSignature,
  Calculator,
  History,
  Layers,
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

      <div className="max-w-4xl mx-auto bg-card text-card-foreground p-4 sm:p-6 rounded-lg shadow-md">
        <Accordion type="multiple" defaultValue={['introduction']} className="w-full">
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
            <AccordionContent className="px-2 pt-2 space-y-6">
              <p>El flujo de trabajo ideal en MedSanTools sigue una secuencia lógica. Comience con los módulos de entrada de datos y avance hacia los de análisis y generación de documentos para obtener los mejores resultados.</p>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg"><FileText className="mr-2 h-5 w-5"/>Paso 1: Ingrese la Información Base</CardTitle>
                  <CardDescription>Reúna toda la información clínica inicial.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Comience con los módulos de entrada. Puede usar uno o varios:</p>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li><strong>Mejora de Redacción Médica:</strong> Pegue sus notas, la historia de la enfermedad actual o cualquier texto clínico. Haga clic en <strong>"Mejorar"</strong>. Este texto refinado es la base para la mayoría de los análisis posteriores.</li>
                      <li><strong>Análisis de Imágenes:</strong> Cargue o pegue una radiografía. Los hallazgos se pueden enviar a las notas clínicas.</li>
                      <li><strong>Extracción desde PDF:</strong> Cargue un documento PDF (ej. epicrisis, laboratorios). Las notas extraídas se añadirán automáticamente al módulo de redacción.</li>
                  </ul>
                  <Image src="https://placehold.co/600x300.png" alt="Screenshot de los módulos de entrada" width={600} height={300} className="rounded-md mt-2" data-ai-hint="medical data entry" />
                </CardContent>
              </Card>
              
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center text-lg"><Lightbulb className="mr-2 h-5 w-5"/>Paso 2: Análisis y Diagnóstico</CardTitle>
                      <CardDescription>Sintetice la información para obtener impresiones diagnósticas.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                      <p>Con la información base consolidada en el módulo de "Mejora de Redacción", proceda a analizarla:</p>
                      <ol className="list-decimal pl-5 space-y-2">
                          <li><strong>Análisis Clínico Asistido:</strong> Genere un análisis completo y uno enfocado a partir de sus notas. Este es un paso crucial para dar contexto a la IA.</li>
                          <li><strong>Diagnóstico Inteligente:</strong> El sistema usará todos los resúmenes y análisis para sugerir diagnósticos (CIE-10). Valide los que considere correctos marcando la casilla correspondiente. Esto es vital para los siguientes pasos.</li>
                      </ol>
                  </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg"><ListChecks className="mr-2 h-5 w-5"/>Paso 3: Genere Planes y Documentos Clínicos</CardTitle>
                    <CardDescription>Cree planes de tratamiento, órdenes y más, basados en los diagnósticos validados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p>Una vez validados los diagnósticos, los siguientes módulos se pre-llenarán con información contextual relevante:</p>
                  <ul className="list-disc pl-5 space-y-2">
                      <li><strong>Plan Terapéutico:</strong> Reciba sugerencias de medicamentos y conductas.</li>
                      <li><strong>Examen Físico Dirigido:</strong> Obtenga una descripción de examen físico con hallazgos patológicos relevantes a los diagnósticos.</li>
                      <li><strong>Órdenes Médicas:</strong> Genere órdenes de hospitalización u observación completas.</li>
                  </ul>
                  <Image src="https://placehold.co/600x300.png" alt="Screenshot de los Módulos de Generación" width={600} height={300} className="rounded-md mt-2" data-ai-hint="medical form application" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg"><UserCheck className="mr-2 h-5 w-5"/>Paso 4: Prepare el Egreso del Paciente</CardTitle>
                  <CardDescription>Genere toda la documentación de salida de forma rápida y estructurada.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p>Los diagnósticos validados también alimentan los documentos de egreso:</p>
                  <ul className="list-disc pl-5 space-y-2">
                      <li><strong>Consejos para Paciente:</strong> Genere automáticamente recomendaciones, signos de alarma, indicaciones de dieta y cuidados generales.</li>
                      <li><strong>Resumen de Egreso:</strong> Los consejos generados se autocompletarán en este módulo. Complete el resto de campos (fórmula médica, etc.) para obtener un documento de salida completo.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg"><Bot className="mr-2 h-5 w-5"/>Otras Herramientas Útiles</CardTitle>
                  <CardDescription>Módulos independientes para tareas específicas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p>Explore herramientas adicionales que puede usar en cualquier momento:</p>
                  <ul className="list-disc pl-5 space-y-2">
                      <li><strong>Asistente Médico IA:</strong> Un chat para resolver dudas clínicas.</li>
                      <li><strong>Estandarizador de Paraclínicos:</strong> Convierta texto de laboratorios en formatos estandarizados.</li>
                      <li><strong>Justificaciones Médicas:</strong> Genere textos para justificar procedimientos o tratamientos.</li>
                      <li><strong>Calculadora de Dosis:</strong> Calcule dosis y perfusiones de medicamentos comunes.</li>
                  </ul>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          {/* Section 3: Detailed Modules - NEW SECTION */}
          <AccordionItem value="module-details">
            <AccordionTrigger className="text-xl font-headline">
                <Layers className="mr-3 h-6 w-6 text-accent" />
                Descripción Detallada de Módulos
            </AccordionTrigger>
            <AccordionContent className="px-2 pt-2 space-y-2">
                <p className="text-sm text-muted-foreground mb-4">
                    Haga clic en cada módulo para expandir y ver una descripción detallada de su función, entradas requeridas y salidas generadas.
                </p>
                <Accordion type="multiple" className="w-full">
                    <AccordionItem value="text-analysis">
                        <AccordionTrigger><ClipboardEdit className="mr-2 h-5 w-5"/>Mejora de Redacción Médica</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm"><strong>Función:</strong> Refina y expande texto clínico, como notas de enfermedad actual o ideas, para crear un párrafo coherente y profesional.</p>
                            <p className="text-sm mt-1"><strong>Entrada:</strong> Texto libre ingresado por el usuario.</p>
                            <p className="text-sm mt-1"><strong>Salida:</strong> Un texto mejorado que sirve como base para otros módulos de análisis.</p>
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="clinical-analysis">
                        <AccordionTrigger><Brain className="mr-2 h-5 w-5"/>Análisis Clínico Asistido por IA</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm"><strong>Función:</strong> A partir del texto médico mejorado, genera un análisis clínico completo (para contexto profesional) y un resumen enfocado.</p>
                            <p className="text-sm mt-1"><strong>Entrada:</strong> El texto generado por el módulo de "Mejora de Redacción".</p>
                            <p className="text-sm mt-1"><strong>Salida:</strong> Dos análisis de texto (completo y enfocado) que alimentan el módulo de diagnóstico.</p>
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="diagnosis-support">
                        <AccordionTrigger><Lightbulb className="mr-2 h-5 w-5"/>Diagnóstico Inteligente Asistido por IA</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm"><strong>Función:</strong> Sugiere diagnósticos diferenciales (con códigos CIE-10) basados en toda la información clínica consolidada.</p>
                            <p className="text-sm mt-1"><strong>Entrada:</strong> Datos de todos los módulos de entrada (texto, PDF, imágenes).</p>
                            <p className="text-sm mt-1"><strong>Salida:</strong> Una lista de diagnósticos con puntajes de confianza, que el usuario debe validar. Los diagnósticos validados son cruciales para los módulos de generación.</p>
                        </AccordionContent>
                    </AccordionItem>
                    
                     <AccordionItem value="physical-exam">
                        <AccordionTrigger><Stethoscope className="mr-2 h-5 w-5"/>Generador de Examen Físico Dirigido</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm"><strong>Función:</strong> Crea una descripción de examen físico modificando una plantilla normal para incluir hallazgos patológicos esperados según los diagnósticos validados.</p>
                            <p className="text-sm mt-1"><strong>Entrada:</strong> Los diagnósticos validados por el usuario.</p>
                            <p className="text-sm mt-1"><strong>Salida:</strong> Un texto de examen físico listo para ser copiado.</p>
                        </AccordionContent>
                    </AccordionItem>
                    
                     <AccordionItem value="treatment-plan">
                        <AccordionTrigger><ListChecks className="mr-2 h-5 w-5"/>Sugerencia de Plan Terapéutico</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm"><strong>Función:</strong> Sugiere medicamentos y conductas (ej. paraclínicos, interconsultas) relevantes para los diagnósticos validados.</p>
                            <p className="text-sm mt-1"><strong>Entrada:</strong> Los diagnósticos validados y el contexto de los análisis.</p>
                            <p className="text-sm mt-1"><strong>Salida:</strong> Una lista de sugerencias de medicamentos y procedimientos.</p>
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="medical-orders">
                        <AccordionTrigger><FileEdit className="mr-2 h-5 w-5"/>Órdenes Médicas Generales</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm"><strong>Función:</strong> Genera órdenes médicas completas y estructuradas para hospitalización, observación o egreso.</p>
                            <p className="text-sm mt-1"><strong>Entrada:</strong> Campos estructurados (tipo de orden, oxígeno, medicamentos, dieta, etc.).</p>
                            <p className="text-sm mt-1"><strong>Salida:</strong> Un texto de órdenes médicas formateado y en mayúsculas.</p>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="patient-advice">
                        <AccordionTrigger><UserCheck className="mr-2 h-5 w-5"/>Recomendaciones y Consejos para Paciente</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm"><strong>Función:</strong> Crea recomendaciones, signos de alarma, indicaciones de dieta y cuidados generales para el paciente.</p>
                            <p className="text-sm mt-1"><strong>Entrada:</strong> Los diagnósticos validados o un texto manual.</p>
                            <p className="text-sm mt-1"><strong>Salida:</strong> Textos claros y en mayúsculas listos para ser entregados al paciente o incluidos en el resumen de egreso.</p>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="discharge-summary">
                        <AccordionTrigger><FileOutput className="mr-2 h-5 w-5"/>Generador de Resumen de Egreso</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm"><strong>Función:</strong> Consolida toda la información de salida en un documento de egreso estructurado.</p>
                            <p className="text-sm mt-1"><strong>Entrada:</strong> Campos como fórmula médica, conciliación, control. Se autocompleta con los datos del módulo de "Consejos para Paciente".</p>
                            <p className="text-sm mt-1"><strong>Salida:</strong> Un resumen de egreso completo y profesional.</p>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="pdf-extraction">
                        <AccordionTrigger><FileText className="mr-2 h-5 w-5"/>Extracción desde Documentos (PDF)</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm"><strong>Función:</strong> Extrae datos estructurados (ej. nombre, fecha) y notas clínicas de un documento PDF.</p>
                            <p className="text-sm mt-1"><strong>Entrada:</strong> Un archivo PDF.</p>
                            <p className="text-sm mt-1"><strong>Salida:</strong> Una lista de datos clave-valor y un bloque de texto con las notas, que se añade al módulo de "Mejora de Redacción".</p>
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="image-analysis">
                        <AccordionTrigger><ImageIconLucide className="mr-2 h-5 w-5"/>Análisis Avanzado de Imágenes Médicas</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm"><strong>Función:</strong> Analiza imágenes radiográficas para identificar hallazgos y generar un reporte.</p>
                            <p className="text-sm mt-1"><strong>Entrada:</strong> Un archivo de imagen (ej. .jpg, .png).</p>
                            <p className="text-sm mt-1"><strong>Salida:</strong> Un resumen de hallazgos y una lectura radiológica detallada, ambos pueden ser enviados al módulo de "Mejora de Redacción".</p>
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="lab-standardizer">
                        <AccordionTrigger><FlaskConical className="mr-2 h-5 w-5"/>Estandarizador de Paraclínicos</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm"><strong>Función:</strong> Convierte texto desestructurado de resultados de laboratorio en dos formatos estándar: uno abreviado para entrega de turno y otro completo para sistemas.</p>
                            <p className="text-sm mt-1"><strong>Entrada:</strong> Texto libre con resultados de laboratorio.</p>
                            <p className="text-sm mt-1"><strong>Salida:</strong> Dos bloques de texto formateado.</p>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="medical-justification">
                        <AccordionTrigger><FileSignature className="mr-2 h-5 w-5"/>Justificaciones Médicas Asistidas</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm"><strong>Función:</strong> Genera un texto profesional para justificar un procedimiento, tratamiento o concepto médico.</p>
                            <p className="text-sm mt-1"><strong>Entrada:</strong> El concepto a justificar y opcionalmente, contexto clínico del paciente.</p>
                            <p className="text-sm mt-1"><strong>Salida:</strong> Un párrafo de justificación bien redactado.</p>
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="medical-chat">
                        <AccordionTrigger><Bot className="mr-2 h-5 w-5"/>Asistente Médico IA</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm"><strong>Función:</strong> Un chatbot para resolver dudas clínicas, discutir tratamientos, mecanismos de acción, etc., con un enfoque técnico.</p>
                            <p className="text-sm mt-1"><strong>Entrada:</strong> Preguntas del usuario en un formato de chat.</p>
                            <p className="text-sm mt-1"><strong>Salida:</strong> Respuestas basadas en evidencia, citando fuentes cuando es posible.</p>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="dose-calculator">
                        <AccordionTrigger><Calculator className="mr-2 h-5 w-5"/>Calculadora de Dosis y Perfusión</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm"><strong>Función:</strong> Calcula dosis en bolo y tasas de infusión para medicamentos comunes en UCI y urgencias.</p>
                            <p className="text-sm mt-1"><strong>Entrada:</strong> Peso del paciente, medicamento, dosis y detalles de dilución.</p>
                            <p className="text-sm mt-1"><strong>Salida:</strong> El bolo total calculado o la velocidad de perfusión en ml/hora.</p>
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="history">
                        <AccordionTrigger><History className="mr-2 h-5 w-5"/>Historial de Trabajo</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm"><strong>Función:</strong> Registra cada operación realizada, permitiendo ver detalles, cargar entradas anteriores a los módulos, y exportar/importar el historial.</p>
                            <p className="text-sm mt-1"><strong>Entrada:</strong> Se alimenta automáticamente de las acciones en otros módulos (si el guardado automático está activado).</p>
                            <p className="text-sm mt-1"><strong>Salida:</strong> Un registro cronológico de tu trabajo en la plataforma.</p>
                        </AccordionContent>
                    </AccordionItem>

                </Accordion>
            </AccordionContent>
          </AccordionItem>

          {/* Section 4: FAQ */}
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

          {/* Section 5: Limitations */}
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

          {/* Section 6: Contact */}
          <AccordionItem value="contact">
            <AccordionTrigger className="text-xl font-headline">
              <Mail className="mr-3 h-6 w-6 text-accent" />
              Contacto y Soporte
            </AccordionTrigger>
            <AccordionContent className="px-2 pt-2">
              <p>Actualmente, el soporte se maneja a través del repositorio del proyecto. Para reportar errores, sugerir nuevas funcionalidades o contactar con el desarrollador, por favor visite nuestro GitHub (próximamente).</p>
            </AccordionContent>
          </AccordionItem>

          {/* Section 7: Useful Links */}
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
    </div>
  );
}
