
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Users, Target, HeartHandshake, Info, Cpu, FileJson, Link as LinkIcon, Linkedin, Github } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const technologies = [
  'Next.js', 'React', 'TypeScript', 'Tailwind CSS',
  'Shadcn/UI', 'Genkit (Google AI)', 'Dexie.js'
];

export function AboutContent() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Acerca de MedSanTools</h1>
        <p className="text-lg text-muted-foreground mt-2">Plataforma Inteligente de Análisis Clínico y Soporte Diagnóstico Avanzado</p>
      </header>
      
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        
        {/* ¿Quiénes somos? */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-headline">
              <Users className="mr-3 h-6 w-6 text-accent" />
              ¿Quiénes Somos?
            </CardTitle>
            <CardDescription>Nuestro Origen e Identidad</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p><strong>MedSanTools</strong> es un proyecto innovador desarrollado por un apasionado profesional de la salud con experiencia en desarrollo de software, con el objetivo de cerrar la brecha entre la práctica clínica y la tecnología de vanguardia.</p>
            <p>Nacido de la necesidad de optimizar tareas repetitivas y mejorar la precisión diagnóstica en entornos de alta demanda, este proyecto busca empoderar a médicos, residentes y estudiantes con herramientas inteligentes que potencien su juicio clínico, no que lo reemplacen.</p>
            <p>Nuestros valores fundamentales son la <strong>eficiencia</strong>, la <strong>precisión</strong> y la <strong>seguridad</strong>. Cada herramienta está diseñada para ser intuitiva, útil y respetuosa con la confidencialidad de los datos, operando localmente en su navegador.</p>
          </CardContent>
        </Card>

        {/* ¿Qué hacemos? */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-headline">
              <Target className="mr-3 h-6 w-6 text-accent" />
              ¿Qué Hacemos?
            </CardTitle>
             <CardDescription>Nuestras Herramientas y Propósito</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>MedSanTools ofrece una suite de módulos asistidos por IA para resolver problemas comunes en la práctica médica diaria:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Análisis y Redacción:</strong> Desde mejorar la calidad de las notas clínicas hasta extraer datos de PDFs e imágenes.</li>
              <li><strong>Soporte Diagnóstico:</strong> Sugerimos diagnósticos diferenciales, planes terapéuticos y exámenes físicos dirigidos basados en la información consolidada.</li>
              <li><strong>Generación de Documentos:</strong> Creamos rápidamente órdenes médicas, justificaciones, resúmenes de egreso y consejos para pacientes.</li>
            </ul>
            <p>Nuestro público objetivo son los <strong>profesionales de la salud</strong> que buscan una herramienta de apoyo para agilizar su flujo de trabajo, mejorar la calidad de su documentación y enriquecer su proceso de toma de decisiones clínicas.</p>
          </CardContent>
        </Card>

        {/* ¿Por qué lo hacemos? */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-headline">
              <HeartHandshake className="mr-3 h-6 w-6 text-accent" />
              ¿Por Qué lo Hacemos?
            </CardTitle>
             <CardDescription>Nuestra Misión y Visión</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p><strong>Misión:</strong> Proporcionar a los profesionales de la salud herramientas de IA avanzadas, seguras y fáciles de usar que optimicen su tiempo, reduzcan el agotamiento y mejoren la calidad de la atención al paciente.</p>
            <p><strong>Visión:</strong> Ser la plataforma de referencia para el soporte clínico inteligente, integrando de forma transparente la inteligencia artificial en el flujo de trabajo médico para facilitar decisiones más informadas y eficientes.</p>
             <p><strong>Valores:</strong> Creemos en la tecnología como un aliado, en la importancia del juicio clínico humano como pilar central, y en la necesidad de construir soluciones que prioricen la privacidad y la seguridad de los datos.</p>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-headline">
              <Info className="mr-3 h-6 w-6 text-accent" />
              Información Adicional
            </CardTitle>
            <CardDescription>Detalles del Proyecto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold flex items-center mb-2"><Cpu className="mr-2 h-5 w-5"/>Tecnologías Utilizadas</h4>
              <div className="flex flex-wrap gap-2">
                {technologies.map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}
              </div>
            </div>
            <div>
              <h4 className="font-semibold flex items-center mb-2"><FileJson className="mr-2 h-5 w-5"/>Estado y Licencia</h4>
              <p>MedSanTools se encuentra en <strong>desarrollo activo (Beta)</strong>. La licencia de uso es permisiva para fines educativos y de prueba, pero no debe ser utilizada para decisiones clínicas reales sin la supervisión y validación de un profesional calificado.</p>
            </div>
             <div>
              <h4 className="font-semibold flex items-center mb-2"><LinkIcon className="mr-2 h-5 w-5"/>Contacto y Redes</h4>
               <div className="flex space-x-4">
                 <Link href="#" className="flex items-center hover:text-primary transition-colors"><Linkedin className="mr-1 h-5 w-5"/> LinkedIn</Link>
                 <Link href="#" className="flex items-center hover:text-primary transition-colors"><Github className="mr-1 h-5 w-5"/> GitHub</Link>
               </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
