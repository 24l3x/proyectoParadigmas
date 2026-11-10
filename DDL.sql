-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.usuario (
  id_usuario uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  apellidos text NOT NULL,
  contrasena text NOT NULL,
  rol text NOT NULL,
  estado text NOT NULL,
  correo text,
  CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario)
);
CREATE TABLE public.paciente (
  id_usuario uuid NOT NULL,
  num_paciente text NOT NULL UNIQUE,
  estado_clinico text,
  CONSTRAINT paciente_pkey PRIMARY KEY (id_usuario),
  CONSTRAINT paciente_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario)
);
CREATE TABLE public.empleado (
  id_usuario uuid NOT NULL,
  num_empleado text NOT NULL UNIQUE,
  telefono text,
  CONSTRAINT empleado_pkey PRIMARY KEY (id_usuario),
  CONSTRAINT empleado_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario)
);
CREATE TABLE public.asignacion_turno (
  id_turno integer NOT NULL DEFAULT nextval('asignacion_turno_id_turno_seq'::regclass),
  num_empleado text,
  lugar_asignado text,
  horario_descripcion text,
  CONSTRAINT asignacion_turno_pkey PRIMARY KEY (id_turno),
  CONSTRAINT asignacion_turno_num_empleado_fkey FOREIGN KEY (num_empleado) REFERENCES public.empleado(num_empleado)
);
CREATE TABLE public.expediente (
  id_expediente integer NOT NULL DEFAULT nextval('expediente_id_expediente_seq'::regclass),
  num_paciente text,
  fecha_creacion date DEFAULT CURRENT_DATE,
  CONSTRAINT expediente_pkey PRIMARY KEY (id_expediente),
  CONSTRAINT expediente_num_paciente_fkey FOREIGN KEY (num_paciente) REFERENCES public.paciente(num_paciente)
);
CREATE TABLE public.cita (
  num_cita integer NOT NULL DEFAULT nextval('cita_num_cita_seq'::regclass),
  fecha date NOT NULL,
  hora time without time zone NOT NULL,
  estado text NOT NULL,
  mot_cancelacion text,
  num_paciente text,
  num_empleado_medico text,
  creada_por_usuario uuid,
  CONSTRAINT cita_pkey PRIMARY KEY (num_cita),
  CONSTRAINT cita_num_paciente_fkey FOREIGN KEY (num_paciente) REFERENCES public.paciente(num_paciente),
  CONSTRAINT cita_num_empleado_medico_fkey FOREIGN KEY (num_empleado_medico) REFERENCES public.empleado(num_empleado),
  CONSTRAINT cita_creada_por_usuario_fkey FOREIGN KEY (creada_por_usuario) REFERENCES public.usuario(id_usuario)
);
CREATE TABLE public.consulta (
  id_consulta integer NOT NULL DEFAULT nextval('consulta_id_consulta_seq'::regclass),
  num_cita integer,
  id_expediente integer,
  sintomas_diagnostico text,
  mot_alta text,
  CONSTRAINT consulta_pkey PRIMARY KEY (id_consulta),
  CONSTRAINT consulta_num_cita_fkey FOREIGN KEY (num_cita) REFERENCES public.cita(num_cita),
  CONSTRAINT consulta_id_expediente_fkey FOREIGN KEY (id_expediente) REFERENCES public.expediente(id_expediente)
);
CREATE TABLE public.medicamento (
  id_medicamento integer NOT NULL DEFAULT nextval('medicamento_id_medicamento_seq'::regclass),
  nombre_farmaco text NOT NULL,
  CONSTRAINT medicamento_pkey PRIMARY KEY (id_medicamento)
);
CREATE TABLE public.tratamiento (
  id_tratamiento integer NOT NULL DEFAULT nextval('tratamiento_id_tratamiento_seq'::regclass),
  id_consulta integer,
  id_medicamento integer,
  dosis text,
  frecuencia text,
  duracion text,
  CONSTRAINT tratamiento_pkey PRIMARY KEY (id_tratamiento),
  CONSTRAINT tratamiento_id_consulta_fkey FOREIGN KEY (id_consulta) REFERENCES public.consulta(id_consulta),
  CONSTRAINT tratamiento_id_medicamento_fkey FOREIGN KEY (id_medicamento) REFERENCES public.medicamento(id_medicamento)
);