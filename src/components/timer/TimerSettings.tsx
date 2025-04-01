
import React from 'react';
import { useTimerContext } from '@/context/TimerContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

const TimerSettings: React.FC = () => {
  const { settings, updateSettings } = useTimerContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres du Timer</CardTitle>
        <CardDescription>Personnalisez les durées des sessions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="focus-duration">Focus</Label>
            <span className="text-sm text-muted-foreground">{settings.focusDuration} min</span>
          </div>
          <Slider
            id="focus-duration"
            min={5}
            max={60}
            step={5}
            value={[settings.focusDuration]}
            onValueChange={(values) => updateSettings({ focusDuration: values[0] })}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="short-break">Pause courte</Label>
            <span className="text-sm text-muted-foreground">{settings.shortBreakDuration} min</span>
          </div>
          <Slider
            id="short-break"
            min={1}
            max={15}
            step={1}
            value={[settings.shortBreakDuration]}
            onValueChange={(values) => updateSettings({ shortBreakDuration: values[0] })}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="long-break">Pause longue</Label>
            <span className="text-sm text-muted-foreground">{settings.longBreakDuration} min</span>
          </div>
          <Slider
            id="long-break"
            min={5}
            max={30}
            step={5}
            value={[settings.longBreakDuration]}
            onValueChange={(values) => updateSettings({ longBreakDuration: values[0] })}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="long-break-interval">Intervalle des pauses longues</Label>
            <span className="text-sm text-muted-foreground">Après {settings.longBreakInterval} sessions</span>
          </div>
          <Slider
            id="long-break-interval"
            min={2}
            max={6}
            step={1}
            value={[settings.longBreakInterval]}
            onValueChange={(values) => updateSettings({ longBreakInterval: values[0] })}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TimerSettings;
