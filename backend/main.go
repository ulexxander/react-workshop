package main

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
)

var flagAddr = flag.String("addr", ":80", "Address to run API HTTP server on")

func main() {
	flag.Parse()

	handler := newHandler()

	log.Println("Starting HTTP server on", *flagAddr)
	if err := http.ListenAndServe(*flagAddr, handler); err != nil {
		log.Fatalf("Error listening HTTP: %s", err)
	}
}

type Note struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
}

type NoteCreateParams struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

type handler struct {
	*chi.Mux
	notes []Note
}

func newHandler() *handler {
	h := &handler{
		Mux:   chi.NewMux(),
		notes: []Note{},
	}

	h.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			log.Println("Incoming API request:", r.Method, r.URL)
			next.ServeHTTP(w, r)
		})
	})

	h.Get("/notes", func(w http.ResponseWriter, r *http.Request) {
		responseData(w, h.notes)
	})

	h.Get("/notes/{id}", func(w http.ResponseWriter, r *http.Request) {
		noteID := chi.URLParam(r, "id")
		noteIDInt, err := strconv.Atoi(noteID)
		if err != nil {
			responseError(w, &Error{
				Code:    ErrorNoteIDInvalid,
				Message: fmt.Sprintf("Note ID is invalid: %s", noteID),
			})
			return
		}

		for _, note := range h.notes {
			if note.ID == noteIDInt {
				responseData(w, note)
				return
			}
		}

		responseError(w, &Error{
			Code:    ErrorNoteNotFound,
			Message: fmt.Sprintf("Note not found: %s", noteID),
		})
	})

	h.Post("/notes", func(w http.ResponseWriter, r *http.Request) {
		var p NoteCreateParams
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			responseError(w, &Error{
				Code:    ErrorBodyInvalid,
				Message: "Request body is not valid JSON",
			})
			return
		}

		if p.Title == "" {
			responseError(w, &Error{
				Code:    ErrorNoteTitleInvalid,
				Message: "Note title can not be empty",
			})
			return
		}

		if p.Content == "" {
			responseError(w, &Error{
				Code:    ErrorNoteContentInvalid,
				Message: "Note content can not be empty",
			})
			return
		}

		note := Note{
			ID:        len(h.notes),
			Title:     p.Title,
			Content:   p.Content,
			CreatedAt: time.Now(),
		}
		h.notes = append(h.notes, note)

		responseData(w, note)
	})

	return h
}

type Response struct {
	Data  interface{} `json:"data"`
	Error *Error      `json:"error,omitempty"`
}

type Error struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func (e *Error) Error() string {
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

const (
	ErrorBodyInvalid        = "body_invalid"
	ErrorInternal           = "internal"
	ErrorNoteContentInvalid = "note_content_invalid"
	ErrorNoteIDInvalid      = "note_id_invalid"
	ErrorNoteNotFound       = "note_not_found"
	ErrorNoteTitleInvalid   = "note_title_invalid"
)

var errorsStatusCodes = map[string]int{
	ErrorBodyInvalid:        http.StatusBadRequest,
	ErrorInternal:           http.StatusInternalServerError,
	ErrorNoteContentInvalid: http.StatusUnprocessableEntity,
	ErrorNoteIDInvalid:      http.StatusBadRequest,
	ErrorNoteNotFound:       http.StatusNotFound,
	ErrorNoteTitleInvalid:   http.StatusUnprocessableEntity,
}

func response(w http.ResponseWriter, res interface{}) {
	w.Header().Add("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(res); err != nil {
		log.Println("Error sending JSON response:", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
}

func responseData(w http.ResponseWriter, data interface{}) {
	res := Response{Data: data}
	response(w, res)
}

func responseError(w http.ResponseWriter, err error) {
	var apiErr *Error
	if !errors.As(err, &apiErr) {
		apiErr = &Error{
			Code:    ErrorInternal,
			Message: "Internal error",
		}
	}

	statusCode, ok := errorsStatusCodes[apiErr.Code]
	if !ok {
		statusCode = http.StatusInternalServerError
	}

	log.Printf("API request error: %s [%d]", apiErr, statusCode)

	w.WriteHeader(statusCode)
	response(w, apiErr)
}
