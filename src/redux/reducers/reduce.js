const INIT_STATE = {
  carts: [],
};

export const cartreducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case "ADD_CART":
      const IteamIndex = state.carts.findIndex(
        (iteam) => iteam.id === action.payload.id
      );

      if (IteamIndex >= 0) {
        const updatedCarts = [...state.carts]; 
        updatedCarts[IteamIndex] = {
          ...updatedCarts[IteamIndex],
          qnty: updatedCarts[IteamIndex].qnty + 1,
        };
        return {
          ...state,
          carts: updatedCarts,
        };
      } else {
        const temp = { ...action.payload, qnty: 1 };
        return {
          ...state,
          carts: [...state.carts, temp],
        };
      }
    case "DEL_CART":
      return {
        ...state,
        carts: state.carts.filter((e) => {
          return e.id != action.payload;
        }),
      };

    case "RMV_ONE":
      const itemIndex = state.carts.findIndex(
        (item) => item.id === action.payload.id
      );

      if (itemIndex >= 0) {
        if (state.carts[itemIndex].qnty > 1) {
          const updatedCarts = [...state.carts];
          updatedCarts[itemIndex] = {
            ...updatedCarts[itemIndex],
            qnty: updatedCarts[itemIndex].qnty - 1,
          };

          return {
            ...state,
            carts: updatedCarts,
          };
        } else if (state.carts[itemIndex].qnty === 1) {
          // Remove the item entirely
          const updatedCarts = state.carts.filter(
            (el) => el.id !== action.payload.id
          );

          return {
            ...state,
            carts: updatedCarts,
          };
        }
      }
    default:
      return state;
  }
};
