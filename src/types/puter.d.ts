// Type declarations for the global Puter.js SDK (loaded via <script src="https://js.puter.com/v2/">)

export {};

declare global {
  interface Window {
    puter: PuterSDK;
  }

  var puter: PuterSDK;
}

interface PuterSDK {
  auth: {
    signIn(opts?: { attempt_temp_user_creation?: boolean; request_auth?: boolean }): Promise<PutterUser>;
    signOut(): Promise<void>;
    getUser(): Promise<PutterUser | null>;
    isSignedIn(): boolean;
    getProfile?(): Promise<PutterProfile>;
  };

  kv: {
    get<T = unknown>(key: string): Promise<T | null>;
    set<T = unknown>(key: string, value: T): Promise<boolean>;
    del(key: string): Promise<boolean>;
  };

  fs: {
    readdir(path: string): Promise<any>;
    readFile(path: string, encoding?: string): Promise<string>;
    writeFile(path: string, data: string): Promise<any>;
    mkdir(path: string): Promise<any>;
  };
}

interface PutterUser {
  id: string;
  uuid: string;
  username: string;
  name?: string;
  email?: string;
  avatar?: string;
  type?: string;
  plan?: string;
  created: string;
}

interface PutterProfile {
  id: string;
  uuid: string;
  username: string;
  name?: string;
  email?: string;
  avatar?: string;
  type?: string;
  plan?: string;
  created: string;
}
