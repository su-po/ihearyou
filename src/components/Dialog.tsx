import { Children, ReactNode } from "react"
import {
  useOverlay,
  usePreventScroll,
  useModal,
  OverlayContainer,
  FocusScope
} from "react-aria"




type DialogProps = {
  children: ReactNode;
  isOpen: boolean;
  title: string;
}

function Dialog({ children, isOpen, title }: DialogProps) {


  let focusRef = useRef<FocusScope>(null)

  return (
    <div>{children}</div>
  )



}


export default Dialog






