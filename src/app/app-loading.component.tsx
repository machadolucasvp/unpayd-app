import { AppLoading as ExpoAppLoading } from 'expo';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React from 'react';

export type TaskResult = [string, any];
export type Task = () => Promise<TaskResult | null>;

export interface IApplicationLoaderProps {
  tasks?: Task[];
  initialConfig?: Record<string, any>;
  placeholder?: (props: { loading: boolean }) => React.ReactElement;
  children: (config: any) => React.ReactElement;
}

export const LoadFontsTask = (fonts: { [key: string]: number }): Promise<TaskResult> => {
  return Font.loadAsync(fonts).then(() => null);
};

export const LoadAssetsTask = (assets: number[]): Promise<TaskResult> => {
  const tasks: Promise<Asset>[] = assets.map((source: number) => {
    return Asset.fromModule(source).downloadAsync();
  });

  return Promise.all(tasks).then(() => null);
};

SplashScreen.preventAutoHideAsync();

export const AppLoading = (props: IApplicationLoaderProps): React.ReactElement => {

  const [loading, setLoading] = React.useState<boolean>(true);
  const loadingResult = props.initialConfig || {};

  const onTasksFinish = async () => {
    setLoading(false);
    await SplashScreen.hideAsync();
  };

  const saveTaskResult = (result: [string, any] | null): void => {
    if (result) {
      loadingResult[result[0]] = result[1];
    }
  };

  const createRunnableTask = (task: Task): Promise<void> => {
    return task().then(saveTaskResult);
  };

  const startTasks = (): Promise<any> => {
    if (props.tasks) {
      return Promise.all(props.tasks.map(createRunnableTask));
    }
    
    return Promise.resolve();
  };

  const renderLoadingElement = (): React.ReactElement => (
    <ExpoAppLoading
      startAsync={startTasks}
      onFinish={onTasksFinish}
      autoHideSplash={false}
    />
  );

  return (
    <React.Fragment>
      {loading ? renderLoadingElement() : props.children(loadingResult)}
      {props.placeholder && props.placeholder({ loading })}
    </React.Fragment>
  );
};