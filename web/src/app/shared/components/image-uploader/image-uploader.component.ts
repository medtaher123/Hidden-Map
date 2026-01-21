import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, inject, Output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FileService } from '../../services/file.service';
import { FileUploadResponse } from '../../models/file-upload.modal';

@Component({
  selector: 'app-image-uploader',
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploaderComponent), // Must match your class name exactly
      multi: true,
    },
  ],
  templateUrl: './image-uploader.component.html',
  styleUrl: './image-uploader.component.css'
})
export class ImageUploaderComponent implements ControlValueAccessor {
  //private locationsService = inject(LocationsService);
  private fileService = inject(FileService);

  images = signal<FileUploadResponse[]>([]);
  isUploading = signal(false);

  onChange: (value: string[]) => void = () => {};
  onTouched: () => void = () => {};
  isDisabled = false;

  writeValue(obj: any): void {
    if (obj === null || obj === undefined) {
      this.images.set([]);
    }
    // Note: If you want to support pre-filling images (edit mode), 
    // you would need to accept an array of objects here, not just IDs.
    // For now, we assume reset() sends null/empty array.
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // 4. SetDisabledState: Angular calls this when you use .disable()
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.upload(file);
    input.value = '';
    this.onTouched(); // Mark as touched so validation triggers
  }

  private upload(file: File) {
    this.isUploading.set(true);

    this.fileService.upload(file).subscribe({
      next: (response: FileUploadResponse) => {
        this.images.update((current) => [...current, response]);
        this.notifyForm();
        this.isUploading.set(false);
      },
      error: (err: any) => {
        console.error('Upload failed', err);
        this.isUploading.set(false);
      }
    });
   /* const newImage: UploadedImage = {
          id: "1234",
          url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEBUSEhIVEBUWFRUVFRAVFRUVEBIVFRUWFhUVFRYYHSggGBolHRUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGy0lHyUtLS0tLS0tLS0tLy0tLS0tLS0tKy4tLS0tLS0tKy0tLS0rLS0tLS0tKy0tLS0tLS0tLf/AABEIALcBEwMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAAFAAEDBAYCBwj/xABBEAABAwIDBQUFBAcIAwAAAAABAAIDBBEFEiEGMUFRYRMicYGRFDKhscFCUnLRByNDgpKi4RUzU2LC0tPwFrLi/8QAGgEAAgMBAQAAAAAAAAAAAAAAAgMAAQQFBv/EACsRAAICAQQBBAECBwAAAAAAAAABAhEDBBIhMUETIlFhcQWRIzJCUrHh8P/aAAwDAQACEQMRAD8A9h7ROJFCnTKMimyftE+dQBdBVQSmybOlmUSV1VBb2TZkxcorp7qUTeOSqtXuVkqvU7lJdB4+zKY0zehtA/VHcXju0rN0Zs4hc3IvednE7gaajKLQoNQlGYE+HRz83ZMCoZyplWqCjfQuPYExF6z9QdUdxEoDPvWLKdTTjUzbuC0ULNEHw2O5R+FmiLAyZ+RNNlM2ZIR6KjNJZbk+DnTjyNXyqzg1UMnJBqqe6qU9WWjQoW+bKSNXXYllYTfgvOsVx65cLqzjOIPc0i9tF5zXVbwSDfehnPgKMeQ2+tappqgPa3wCyPtJRHDazS3WyRurkc0aC1iMo4I/spOQJB4FDsLdmbYb0dwynDM3MolntgPFwZzb45oj0XmcjV6XthYsIvryXmkhsbJu+3wL2pEJjS7JdZwn7QK7ZKic9knT9qEylslI+w8qVl3ZIBarMWw5sku7JWVE2nKVl3ZMoXtOUk5SClk2iKrTlWiFBK1DIZBAavFwVkgLSkLY1zdCshVC0qw5lydTA+DQ0BRiAoFQv0CMQSI4GXMuS4Sqs5Xb5VVqJUTYuK5A2JFBZN6LV7kMcNViys6uBcFrCffWkYxZvDtHLRiUAJmAHP2duGiA10tjqi0lUFl8Wqu8tXgxvshqpxYoH7W4PtwK2uCYY17Q4i91eqtn43jVo8Uai2KckmYTsHP3IDjOzrveHovUaTB2A2slW4U225R47XJanyeCz0uU2KgDy03C3O1WFNa+40WSnpljl7XTNSqSLmF48WH6o5FtKQbu1HNYx1N1XPs55oHGJT3B7FsT7S5vp4rJVBu4lXXU55qPsU3G1ECWNsoEJsqIdgE3st071ED6DB+VJEPYklPVRXoyPr2ySia9StWlMzOhJJ7J7KFcHKVk9k9lCHGVKy7suSpRBnOA6KlNWs3BwJ5BdVeHslN3PO73L2Ckpoomd1uUW8FVNlbqBdWHEaNJ8lmq+lfmByEdbL0JzxZA8ZqLDl80rJiTNGLM06AVLfcicJPNCm1ZJ0Uzaw8kCxsPI7CxYTxXMlI7qpMPqbjciPao/TEKVMzFVR87oa+Ft9619eAWlYPEbiQ2v6rPkwmzFmYTp4Re6JAtt71lmoJHAbz6qnW1728D6q8eKi8mSzUVDG29/wCKB1eGZjcOus3U49KNLFF8PxFzw3Q363WhQbM7nRs9nn5Iw13BHTWRgb1RwqAOaCQr5oWkahNUJR4EOSYOkcwm4NlxXROI5+C4xCnytJa7LbdqgTMWqGuuXNI/Df5WVSe3stJvoz21NG++oLeVwQsXU0Tr7l7lh2KMl95rTz1sPRyym3YoobPZla4mzo2206kDcsuTGpXKLNEMjjw0eWOpXcl02mW5dgzXAOFiCLhWINlARcrDkkoq2a4XJ8HnstNoqD47L0eu2aDVFT4Ey17Anw3IVmSVrkPa7pnnwjHVWoadpW4lwNhGoHohsmFsHJWpymipPaAfZGpIwaNiSmyYPqo96pnXCttVKjjsFfYF3GqOPF2zoBKySdAMGsmITpirKYxXDiuio3K0CwRLXStfrlczd3hr6oqxgcNWt16X+aoV4Bid0cfmmlxmGKNpkeG6c9b8lbpKylyWnYbDv7JgPMNA+Sr1NOGghtmDjbu/QqOLHQ8Xjikfus7KWtPUE7x1CHV2ISkECLKN3e4+Qv0QSm64sOKVleuw0u07eVh/yvJ+YtyVJ2Cv1tXyi33mRu37t7U82LOaTmaTqdb6a26dFD/aziPdvfkdPPqs7mzQkqOhg9YPcxAecLB8gnfh+KD3a6N3jHb5BdtxF/Bp+YXRxOT7vhwQ7/yT9gZU0mL8aqI/uO/2IRNh2Jk6ywHrb/4WzhrC5t3adOHp6IdU4mLnS/S2h1P0IVOXkNP6Mw2gxLhPT+F2/VqjlwbEzvkhPmz/AGrTjEGH9i30SbWR8Iy38OipTXwyN/gyLtm8QOpMJ63Z+Su0+B4qN0kQtu9w/wChaduJN5H/AL5K1FXNO7RMjOPywG38ICU9FjTRpUsA6Nb/AMRTyUmM7jXZfIf8K0D6l3O2l7jlzUZqSeI6/Mnf/wB+ROvl/uRS+l+yMxNg+KO0fiBtyGn+kKKHZ6pDu9WSHp3rW8nrXGS5AFyD9oWcQdBqBrx8gDchT1MJbYEWva7A4XzW3HlcXP5KyjHTbHsdmPtUgNtxDn+hcUIwvZdrnEzB3Zh1nWcMz+V7BbfFZgAGAbyBfdvvvJ3Ws481jNr8UkhY2CG4kkOtt4Atutv0sLpa5Yb4QQi0eGNu1oNmt32AWyDQGgdFmsDp3mFj5u7IRcsykHx1Rr207hG49Q5nyuufq8Eslbf8o16bLGF2UsfFoyVmaWvc3hdH8Ze94y5HN8QhcdGg0+F441NBZsqnK4simxMke7ZDKmpujcmHc9FQqMPW6DilwZJbn2A3PKSMNwlJXvQNM9tjapguGhSLezHFUJJJJUGJMU6RVEOSo3qQqKQq7KSM/jGMxQF7ZniMGxDj7uum/wAkMwjCqd8onknZN9xt7saov0j0PawGw1y382m/1K8fqg6NwLXOjNhq1xafUJU8+x8objwOa4Z9Lxubbu28lHOwHhdfPtFtPXRkFlU49Hhr/i4EojS/pBrO1aaiZ7ohfMyIMY92mgzFugva/RDHVwbClosseTe7SSkODQANTuCjw9umqxTtq6aTNn9szGwa4SxnWzcx1FrXBsNdHE34KxLtXTta0xTytNm5mmPtW37uZoL8puO9rcAkCwsboHJN3YeySVUzfEgBV5JAFkI9qWuY21VDns4uEkcrGiwFmtsLklxI8ibAIb/54DviPiL2PgbnRRzSKWKTNlVS6IYTc71nH7axnexw8Ln6Llu10F9Q8fuoFK2M2NI1kY6lWGWWVj2tpvvOH7v9VI7a6m+84/u/1TfUghTxTfSNU0N5J9OCyJ2ygG4OP7pUL9tG/Zicf4kLyQLWnyvwamuqntacpWKrsfnDiM5HrzurjdsCRY0xd55fzQevqDK67adrPGRxPzSMmSHhmnFpMv8Aay9h+1ssbrvOdp/jHDun6LaYdjYewyXJuAC43zOtuvrw8V5k6gkcNzG9bucR8lZjoZsuX2hzW/daLD5qserxwXuYc/0/NJ+2JtsfxrspYwG9pmbe9gctiOe43shWyTjWYu17t13lo00s0mwusVNSEZz2jzl4lx11Wj2LwmSYsmjkMJiffOL579D4fNOjljJtmbNhnBKLPQaluJukcIqRjQCQ17ixmYDiBe/wQ3FcaxKjI7enzNIveIlw+VlqTjFRlAL7kD3srcx+GiEV47UESFzv3iPMW3IZTxfYMVk+jjZ/bGnqu6QM3FtssjfFm4+S09LTRh4flDw4aPGp/r815FtBs82MiSNzmvzd15Olz9hzt4vwJ08FuNg8eM0ZjlNpGEB99CRubIRwcDZruY14JcnHbT5i+PwE007XDNrX4Yx7NwII0P1CxFbhjmg3G6638EmUWOgINhycNHD6+qAzjMXX3arIoelkcF0Mx+9cmHJKSapac7rbrlJaAT2ALpcBdBdVmBDp0ydUEMmKdMVCHDlBKVO5VpVTLQHxyPNF4fXT6rxfa6ANeLL3CYZmubzC8Z23H6z1WXPzBM16d1JozcTtyiqBYp4joV1VjcViXEjq9wK6lduUKsW7qKRMcbsruXN105cowdp0CkSnsmsqDURAqZiiAViMIZDsceSNynhCiI1VuJqCT4HY4XIsRNVoKGIKZouskmbkqRKrkjLX6D6KOmhu4DqFaxcZY3Hy9VmlL3KJUl5M3HEXRv6kD6r0vZCg7KkZpv1PmsRhVOXiOJurpH/M2v6L2qDDQ2NrLaNAHwXT08Xkk/hHn9fJRUV5AjWXK4qYNETFIGv0Khq2iy2RxX2c31KMhiRaQ6N4u1wII8UI2REjKh4eCHNY9jz94DQH+E3VvaAntNFFgWKCR7yNczX68SD3W/BK9PZcX0xzybqfwenVdSTRGXcQ2OT1ADvqspNjZcLDRaPE4yzDJGjU9nHGB10v8155HC9vvBNyQvbJ90KhOk0i4ZgknbFokl7SWetAroKuHp+0XVow7ixdOFACpGlU0WpHaYprpiVVBWM5VplO4qCYoZLgKLB7jqvLP0j4cWyl/Am/r/W69TkCzO3tGH0+YWJbv8D/AFss7Vpo0Re1pnizd9uamlF2BR1DCHeCsxsux1vELnydcnawe5NA5WodWqs4KSnfYo5covE6lycPCjUz96jIRIko8nTQnskwLqypsbGPAwCmbuXACka1A2Nihmt1V+NirxxotT0+gSMs6NWGBxFEr1PTqzS0aKUtBdc7LqEjTtSVsr4XTd4HxKo7TaBreLiTb5LVwUgYCSeCz0+WWdzz7rN3L/u9ZsOXdk3eEZcuRNNIv/o5wu9QJHa5Bp0J0H1Xqr5AsDs9IIYyeLtVdmxc8CvS6KW3Fb7fJ5nXS35eOlwGa6YA3QGvr1VfWOcd5PRdY1h0sVI+b9pbuNOuW/H8S0xcpuomR0uzHbT19ndhH3ppBZ3EQsI1P4iPRHdh8Bs4G2gt8Nw+qobKbLOc7M/33aySHXXfYHn8l6U6WKhgD3DXdHHxcefh1VcTd+F/1hP2qvJJj0uVrYhw7zvE7lkcWkAFyrDMZD7l7SSTcnqUExx4fuBHmmSyRa4FKLsp/wBrNGiSCOi1TpFjj22O53q3GxKKKynAXUbOeM1q7CYJ0IS4EuSU5VaSW5sFERseacN3+iHT1bjuFlfFJfUpy1jeCukRNgOaN55lRMpC4FrxoUTrq4AaIBU4g7ggcUOi2zyra7DTDO5p56HmOCo4W/W3l5Fb7a2i9oizgd9u/mQvN2EseuZqsXf2dbQ56avwNXQ5JCPRQI1i0OeISDe3Q+CCpGKe6J0MsNs/rtD3T2XKlARskeRNCeyka3RLKgs0KIzQpmNTNarMbEuUh0Ijwx3IWppKSwCC4dFeRvitaxlguZq8tUka8ftRxFCp/aQwKtNUAdSpsOoHSHM7csEqrdLoHJJVyPVSu7F0jtBwHE8llaCrMkzIGcXXcefFEtusTDS2Bu4aut8kP2Wwie/tbIzlad/McbDj4rp6DBePe13yjjazUV7UeguphoPJO3Di4ho1J4KxhbZprERGO/2nb/ILT00EcDdTdx3ne4r0OHHuSfg4OWe115BVHgAY2/2+Dvu+CrVVMXgRB7nNBu+Um7nH7rL/AD4IzPUOkOVoIB4faPjyCs01EI9TZzuA+y38ytUktuyK/IiLae6QMeYqSIOeLcI4R7zj1+pWPrp5J5TLJqeA4NHADotvUYe2Z5L+8evBDqrCiw91twuXroZ0v4atI6Gl9O/f2ZWSSNu828kNra6PgUSx2n0PAjhxWVmgKz4M8pR5GZcKUuBnzNuko/ZymT9wrYe+ArpRgrtdo5I90rpJiVRCnidVkYSOAPwF02He4DvJ1JSrHs0bJo1/dud1zwuqcZdCezfu+y7g4fmiXwQu1VcGoJPWklTT2cdFVNO5QOKOXi4VKRgup6mcNGuiCVWLNBsEI1F5wA8OKz21uzDDF28AuPtNHDqFfgnznf6opR1IjBDu807wlzgpKmFGTi7R5hQVAYDHIO6Ra/1QiojyuLd/I8xwXoG0uzTReWHVh1sPs/0WKnpSTlI14FciWL0pu/J28Op9WCj5QPBU0aQpnB2UjXkrccGUa+HgqlJGnFF+TmIaJKcRBMKZK3I1qxRhXImJqanRGGmudAs+TIkaIIakkyOBtchGIWTy7m5RzOisbO4eC8uIBsN/UrVw0y4+q1cYypLkXkz7OALQYEBq85j8EQxSpbTQOkOlhoOZ4IuyEAXPBeebRV5rZzGw2hjPedwc4cFm0sMmszJeF2c7Lqf6pdIzMNNLWVAAuS91yen5L3TBGiKBkT2ABjQ0GwsQB81h9kq+lp2kgtMh013gcAFqIHTVFnAEN6jK23z+C9xpFGPK/FHG1W6b93HkL1WIAizPDuj4BKnoHuN3dwczq4+XDzXOH0BjNybf5Wor24AW+pS7MVxj0KGAMFmi3M8T4lcVLgxpc42AChlxeJvvPAQ6OsbVHX+6B3fftz6dESVAvkI4ZH3c/F2vlwVx7VF7UwD3gB6IVW42S/soG9s4i+YHuN/EUKVBylYD24o8rDIzeN/UdV5w/Ex0XpO036milfM/O9wPQAkWDWjxXhdZmDt6Rn08XU1xY3BmlW1mnOJjokshndzSSPQQ71GfUwK7uoGuXYK6dHNJLpiVzdNdVRCGupWSxljxcELI4jis1Czs543VUH2Zt7mDgH8dPvBbFxVedoIsQCDwOoKKiGTwvFIajvU0oceMLiGyjwvvRtk+mV3dPI6FZfHtgoZCZID2D9+l8l/Aat8vRApK3FaNuV49pjG5zh2zR52zD0Hiq4/ASsMY5K7NoC4E2uBdUaOlDjqR56IdBtpE4frIXxniYnZ2eJY83H8YRSi2po3aCZn4ZA6N3qQW/wAyXtsaptFuSmDRoPRQkm1zdEKevpz3mEX/ABAs/iaS34obi9Xdum/mLWN/BBO4odjqTCmzmIMJfE4ggjceuixW2lLGyXud034blfgiyODibH4nmhW0UwL7O73zuEnIt+MZF7MnAKmpnBnaNfn+8L94f0U0Dw8XtfSxHUbvqoOzdHq27WvbpmvlcOl1NhmE1T79lE6TjoL7tVyXjbR2YaqK74Om5ORClY1nDeed1J/ZFU24dA8WJB7pNiN+7xU8WHS7yxzfFrh9EiacezTDUwflCp2lEqaJynoMGe4X1/hd+S01BsrUXGaM26lo+qwzcp3si3+E2Nlq8UFzIl2ao7RknS5+QRrM1vXoFPHhEob9hoA3XPyA+qs0uDggOe8no2wH1WBfo+t1E3LZS++P9nIzavHKTbZiNoK+eaZlHE0xdpvkNvdHvHToi1JsbFHHlAzDeRuuePFUcWpsmIOOa4awFvNt76Ivs9jjjJ2T+9fc7iPHpovX/pf6dHS4kpJbvNdHM1OoeT+XohGF08Yu2JjSP8ovfqoanGJ2aNA6cj6LSy0DZHkuFrjzWex6Bsd2m5B3EaO6ea66VdGXdfYJ/wDLp45B2sfd5t/qtHhWLe0ag2HVZukpaiQZQ0vA3OeBu8UQhwh7CD2rQR9houfBUmwmo0FsRw+N4N7X5rOUsdSxx7IhzQ62UXJH0+KtVNLVyvAbcN4uIOg8FpKUNhjDAW3G8uNtedgrcNz4AWZQRQbQySNHa3BP2QfmeStOngpGZGAvef2cYzSOPUDcOpVSsxRgBc+Vzm8Q39Uzzde/8wWLx7bmzTHTZWji5rRbxvxPXVE8ajzLgWsksjqKAu2WPz1Ep7UBjGHuw3vY83EbysfUyFxJO8q3W1BeS5xJJ3k6kofIVlnk3vjo2wxemueyO6SZJVRZ9RBdKNsifOtdGI7umJXOdcucpRBOKic5Jz1XkeiLQ73qlVUofxLDzH1HFTFyYOQhmMx7BOMsDZh/iNAzj6j1WPqcIpXGwe+M8nd4fz6/Feq1tXbRZuuoIZTq2x5hC0WYkbNuBBjljfy1LHehur8TZ292SMvH7rj5FW6vZ8MN2u9DYqShp7aEvPg5ub43+SqimMMThDMkntUVuoeweAcNB5oVWR07zds7n34PZY+oWpa6cD9WHvH3ZWscPK1iFlMZp3OcT2IYeQkH/q7Ueqpx+iKX2cupi5oaJBYaDUXWl2bxuWkA/ViQWte7m6fwlYxkM7bFpe09D/tJROnxWqbbM6/42gfF4SY4oR6VDXknLt2a+DazKJGujd33l7TnaS2+8a2Xbdq4yA17XjmQGOv/ADBYp2LSOvcM38mD5BQ9rnOu/obI5JVRE3dnrtBtTR3vd+nDsxy6OKOU+01O/cX+bbLx3C8LbIf7yRp6E/ktrS7GuDQRLPu/xGgfAK4JLwDJs2smLROBHedfhlKTKvuZY22sLAG7QPQFY6TZyZn7aQDmZXH4ALuEtj9+qv0Pan5uTUoim5E7tmpXve+SdgLzc2a426a2RPCsHjgN+0zHibanpv0CFU+N097dqTbiWtA9XOVwbQ0/B7T4Wcf5GlEooBuYZfUMvfMT0sfyVapcyUjMwutu32+CEvxUu1BncOTIngepAUX9oybhTPPWV8Y+pPwRcAU/k0EkkbRYgDobAejiFSOKW0Y1p/CCfiBl+KB11XUZSXGmpxzJdIfTuhYvFMZ1saySXm2IBjPgL/FWklyVtvyzaYxtQIgTI+3+XM1p9BmKyGKbYTOaTHH2Y4PeL+mfT0CCPxMN1iia0/4ju/J6uug9VK57sz3Fx5k3S56iuh+PTLtolrMQklN5JHSfiJIHgOCh7RR2XLiufklKbts6ONRiuBPeoHlJ7lA5yuCBmzu6SjzJJgs+mmvUmdJJbjEc9ouTIkkoQidIoXuSSVMIgfJZcvlsEkkJZncUqkLZV6p0lQSIquqJQKtqCnSVMKgRJiEjD3XeRAIXD9on/ajjPUAg/O3wTJIbZNqJKbawD3o/g0/kjdHtlTfaDW+MTz/6SJJId7smxFqTHqOTjGf3KgfMlDKyop3OuGReAa8D4tSSTGilGivHJFfSOPyB/JE6bEmtFsrbcu9ZJJAm0E4ploYnB9qKI+MZd8yr9FjFM39nE3wpgfjnSSRp2+RbiFotsKVm8tH4acD/AFFKb9JdM33Q93g0N+ZSSVylt6QKxp9gus/SWXf3cJ8Xv+gQOt23q37nCMcmDX1KSSF5JBrHFAKqxCSQ3fI5/iSVEx6SSBtvsNKizm0VWQpJIJBxOAVy9JJLoYitIoHFJJEkUzjMkkkiBP/Z",
          //file: file
        };

      this.images.update((current: UploadedImage[]) => [...current, newImage]);
      //this.emitChanges();
      this.isUploading.set(false);
    */
  }

  removeImage(id: string) {
    this.images.update((current) => current.filter((img) => img.id !== id));
    this.notifyForm();
  }

  private notifyForm() {
    console.log(this.images())
    const ids = this.images().map((img) => img.id);
    this.onChange(ids); 
  }
}