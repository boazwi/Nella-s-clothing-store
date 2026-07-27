"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product, TryOnStatus } from "@/types";
import { generate, tryOnErrorMessage } from "@/services/tryOn";
import { urlToFile } from "@/lib/image";

interface TryOnState {
  status: TryOnStatus;
  resultUrl: string | null;
  errorMessage: string | null;
}

const INITIAL: TryOnState = { status: "idle", resultUrl: null, errorMessage: null };

/**
 * Encapsulates the try-on state machine: idle → submitting → success | error.
 * Owns the result object URL and revokes it on replacement/unmount.
 */
export function useTryOn() {
  const [state, setState] = useState<TryOnState>(INITIAL);
  const resultUrlRef = useRef<string | null>(null);

  const revoke = useCallback(() => {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
  }, []);

  useEffect(() => revoke, [revoke]);

  const run = useCallback(
    async (personFile: File, garment: Product) => {
      revoke();
      setState({ status: "submitting", resultUrl: null, errorMessage: null });
      try {
        const garmentFile = await urlToFile(garment.imageUrl, `${garment.id}.img`);
        const { imageUrl } = await generate({ personFile, garmentFile });
        resultUrlRef.current = imageUrl;
        setState({ status: "success", resultUrl: imageUrl, errorMessage: null });
      } catch (error) {
        setState({
          status: "error",
          resultUrl: null,
          errorMessage: tryOnErrorMessage(error),
        });
      }
    },
    [revoke],
  );

  const reset = useCallback(() => {
    revoke();
    setState(INITIAL);
  }, [revoke]);

  return { ...state, run, reset };
}
