import React, { useEffect, useRef, useState } from "react";
import { Image, Transition } from "semantic-ui-react";

const LogoLoading = () => {
  const initialVisible = true;
  const [visible, setVisible] = useState(initialVisible);
  const visibleCurrent = useRef(initialVisible);

  const DURATION = 1500;

  useEffect(() => {
    visibleCurrent.current = visible;
  }, [visible]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(!visibleCurrent.current);
    }, DURATION);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Transition animation="fade" visible={visible} duration={DURATION}>
      <Image
        style={{
          maxHeight: "60px",
          bottom: "0",
          left: "0",
          margin: "auto",
          overflow: "auto",
          position: "fixed",
          right: "0",
          top: "0",
          OObjectFit: "contain",
          objectFit: "contain"
        }}
        src="/images/logo-transmate-t.svg"
        alt="logo"
      />
    </Transition>
  );
};

export default LogoLoading;
