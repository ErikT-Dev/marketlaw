export type GuestLogOutIntent =
  | {
      readonly type: "action";
      readonly stateVersion: number;
      readonly action: { readonly type: "leave_game" };
    }
  | { readonly type: "room"; readonly action: { readonly type: "leave_room" } };
