import React from 'react';
import {
  LayoutDashboard,
  Zap,
  Leaf,
  TrendingUp,
  Ruler,
  CircleDot,
  Bot,
  Flame,
  Dumbbell,
  Scale,
  Target,
  Activity,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Moon,
  Bed,
  Sun,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Smile,
  Meh,
  Gauge,
  Check,
  Menu,
  Mail,
  X,
  Home,
  Egg,
  Utensils,
  Trophy,
  ArrowDownCircle,
  ArrowUpCircle,
  Info,
  Salad,
  ChefHat
} from 'lucide-react';

const iconSize = 18;
const iconSizeSm = 16;

export const NavIcons = {
  dashboard: <LayoutDashboard size={iconSize} />,
  workout: <Zap size={iconSize} />,
  diet: <Leaf size={iconSize} />,
  progress: <TrendingUp size={iconSize} />,
  measurements: <Ruler size={iconSize} />,
  checkin: <CircleDot size={iconSize} />,
  coach: <Bot size={iconSize} />
};

export const GoalIcons = {
  weight_loss: <Flame size={iconSizeSm} />,
  muscle_gain: <Dumbbell size={iconSizeSm} />,
  recomposition: <Scale size={iconSizeSm} />,
  maintain: <Target size={iconSizeSm} />,
  endurance: <Activity size={iconSizeSm} />
};

export const GoalLabels = {
  weight_loss: 'Weight Loss',
  muscle_gain: 'Muscle Gain',
  recomposition: 'Body Recomposition',
  maintain: 'Maintain',
  endurance: 'Improve Endurance'
};

export const EnergyIcons = {
  energized: <Zap size={iconSize} />,
  normal: <Smile size={iconSize} />,
  slightly_fatigued: <Meh size={iconSize} />,
  very_tired: <Moon size={iconSize} />
};

export const StatusIcons = {
  completed: <CheckCircle size={iconSizeSm} />,
  partial: <Zap size={iconSizeSm} />,
  skipped: <XCircle size={iconSizeSm} />,
  followed: <CheckCircle size={iconSizeSm} />,
  mostly: <Zap size={iconSizeSm} />,
  deviated: <XCircle size={iconSizeSm} />
};

export { AlertTriangle, BarChart3, Bot, Lightbulb, Bed, Sun, Moon, LogOut, ChevronLeft, ChevronRight, Gauge, Check, Menu, Mail, X, Zap, Flame, Leaf, TrendingUp, Ruler, Target, Activity, Dumbbell, Scale, CircleDot, Home, Egg, Utensils, Trophy, ArrowDownCircle, ArrowUpCircle, Info, Salad, ChefHat };
