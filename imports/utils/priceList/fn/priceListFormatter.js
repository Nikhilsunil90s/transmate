export const formatter = {
  goods(goods) {
    if (goods && Object.keys(goods).length > 0) {
      return Object.keys(goods)
        .map(k => {
          return `${goods[k]}${k}`;
        })
        .join("/ ");
    }
    return " - ";
  },
  equipments(equipments) {
    if (equipments && equipments.length) {
      return equipments.map(eq => `${eq.quantity} ${eq.type}`);
    }
    return " - ";
  }
};
