import { Route, Switch } from "wouter";
import WelcomePage from "./pages/welcome";
import OnboardingPage from "./pages/onboarding";
import ClassificationPage from "./pages/classification";
import DiagnosisPage from "./pages/diagnosis";
import RpePage from "./pages/rpe";
import CheckinPage from "./pages/checkin";
import WorkoutPage from "./pages/workout";
import TimerPage from "./pages/timer";
import DashboardPage from "./pages/dashboard";
import WeeklyPage from "./pages/weekly";
import BuilderPage from "./pages/builder";
import ForcaPage from "./pages/forca";
import ForcaAvaliacaoPage from "./pages/forca-avaliacao";
import ForcaSessaoPage from "./pages/forca-sessao";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={WelcomePage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/classification" component={ClassificationPage} />
      <Route path="/diagnosis" component={DiagnosisPage} />
      <Route path="/rpe" component={RpePage} />
      <Route path="/checkin" component={CheckinPage} />
      <Route path="/workout" component={WorkoutPage} />
      <Route path="/timer" component={TimerPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/weekly" component={WeeklyPage} />
      <Route path="/builder" component={BuilderPage} />
      <Route path="/builder-timer" component={TimerPage} />
      <Route path="/forca" component={ForcaPage} />
      <Route path="/forca/avaliacao" component={ForcaAvaliacaoPage} />
      <Route path="/forca/sessao" component={ForcaSessaoPage} />
    </Switch>
  );
}
